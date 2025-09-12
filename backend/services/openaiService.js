const OpenAI = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');

class OpenAIService {
  // The constructor is fine as is; clients are created per-request.
  constructor() {
    this.client = null;
  }

  async detectPostType(content, apiKey) {
    const heuristic = () => {
      const text = (content || '').toLowerCase();
      const isEvent = /(event|workshop|party|meet|seminar|webinar|conference|rsvp|tomorrow|today|\b\d{1,2}(:\d{2})?\s?(am|pm)\b)/i.test(text);
      const isLostFound = /(lost|found|missing|wallet|id card|keys|phone|bag)/i.test(text);
      if (isLostFound) return 'lost_found';
      if (isEvent) return 'event';
      return 'announcement';
    };

    // --- Primary Strategy: Gemini ---
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey) {
      try {
        const genAI = new GoogleGenerativeAI(geminiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const prompt = `Classify the following text into one of exactly these three types: event, lost_found, announcement.\nReply with only the type.\n\nText: ${content}`;
        const result = await model.generateContent(prompt);
        
        // FIX: Correctly access the text response from the Gemini SDK.
        const response = result.response;
        const text = response.text().trim().toLowerCase();

        if (['event', 'lost_found', 'announcement'].includes(text)) {
          return text; // Success, we're done.
        }
        console.warn(`Gemini returned an invalid type: "${text}". Falling back.`);
      } catch (e) {
        console.error('Gemini classification failed, falling back:', e.message || e);
      }
    }

    // --- Secondary Strategy: OpenAI ---
    if (apiKey) {
      try {
        const client = new OpenAI({ apiKey });
        const response = await client.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: `You are a post classifier. Classify the content into ONE of these types: "event", "lost_found", or "announcement". Respond with only the type in lowercase. Default to "announcement" if unsure.`
            },
            { role: "user", content: content }
          ],
          max_tokens: 10,
          temperature: 0.1
        });

        const classification = response.choices[0].message.content.trim().toLowerCase();
        const validTypes = ['event', 'lost_found', 'announcement'];
        if (validTypes.includes(classification)) {
          return classification;
        }
        return 'announcement'; // Default fallback if OpenAI returns an unexpected value.
      } catch (error) {
        console.error('OpenAI classification failed, falling back to heuristic:', error);
      }
    }
    
    // --- Fallback Strategy: Heuristic ---
    return heuristic();
  }

  async extractEntities(content, postType, apiKey) {
    const heuristic = () => {
      // Heuristic logic remains unchanged, it's a solid fallback.
      const text = content || '';
      if (postType === 'event') {
        const locationMatch = text.match(/at\s+([A-Za-z0-9 &,-]+)/i);
        const dateMatch = text.match(/\b(\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{2,4}|today|tomorrow)\b/i);
        return { title: undefined, location: locationMatch ? locationMatch[1].trim() : null, date: dateMatch ? dateMatch[0] : null };
      }
      if (postType === 'lost_found') {
        const status = /\bfound\b/i.test(text) ? 'found' : (/\blost\b/i.test(text) ? 'lost' : null);
        const itemName = (text.match(/lost\s+(my\s+)?([^,.]+)/i) || [])[2] || (text.match(/found\s+(a\s+|an\s+|the\s+)?([^,.]+)/i) || [])[3] || null;
        const locationMatch = text.match(/near\s+([^,.]+)/i) || text.match(/at\s+([^,.]+)/i);
        return { itemStatus: status, itemName: itemName ? itemName.trim() : null, location: locationMatch ? locationMatch[1].trim() : null };
      }
      if (postType === 'announcement') {
        const deptMatch = text.match(/from\s+the\s+([A-Za-z &]+)\s+department/i) || text.match(/\b([A-Za-z &]+)\s+department\b/i);
        const deadlineMatch = text.match(/deadline\s+(on\s+)?(\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{2,4}|tomorrow|today)/i);
        return { department: deptMatch ? deptMatch[1].trim() : null, deadline: deadlineMatch ? deadlineMatch[2] : null, priority: /urgent|asap|immediately/i.test(text) ? 'high' : 'medium' };
      }
      return {};
    };

    // --- Primary Strategy: Gemini ---
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey) {
      try {
        let systemPrompt = '';
        switch (postType) {
          case 'event': systemPrompt = 'Extract JSON with keys: date, location, title'; break;
          case 'lost_found': systemPrompt = 'Extract JSON with keys: itemStatus, itemName, location'; break;
          case 'announcement': systemPrompt = 'Extract JSON with keys: department, deadline, priority'; break;
          default: return heuristic();
        }
        
        const genAI = new GoogleGenerativeAI(geminiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent(`${systemPrompt}. Return JSON only without explanation.\nText: ${content}`);
        
        // FIX: Correctly access text and clean potential markdown for robust JSON parsing.
        const response = result.response;
        let jsonString = response.text().trim();
        jsonString = jsonString.replace(/^```json\s*/, '').replace(/```$/, '');

        return JSON.parse(jsonString); // Success, we're done.
      } catch (e) {
        console.error('Gemini entity extraction failed, falling back:', e.message || e);
      }
    }
    
    // --- Secondary Strategy: OpenAI ---
    if (apiKey) {
      try {
        let systemPrompt = '';
        switch (postType) {
          case 'event': systemPrompt = `Extract event data. Return JSON with keys: "date", "location", "title". Use null for missing fields.`; break;
          case 'lost_found': systemPrompt = `Extract lost/found data. Return JSON with keys: "itemStatus" ("lost" or "found"), "itemName", "location". Use null for missing fields.`; break;
          case 'announcement': systemPrompt = `Extract announcement data. Return JSON with keys: "department", "deadline", "priority" ("high", "medium", "low"). Use null for missing fields.`; break;
          default: return {};
        }

        const client = new OpenAI({ apiKey });
        const response = await client.chat.completions.create({
          model: "gpt-3.5-turbo",
          response_format: { type: "json_object" }, // Use JSON mode for reliability
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: content }
          ],
          max_tokens: 200,
          temperature: 0.1
        });
        return JSON.parse(response.choices[0].message.content.trim());
      } catch (error) {
        console.error('OpenAI entity extraction failed, falling back to heuristic:', error);
      }
    }

    // --- Fallback Strategy: Heuristic ---
    return heuristic();
  }

  async generatePost(prompt, apiKey) {
    // --- Primary Strategy: Gemini ---
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey) {
      try {
        const genAI = new GoogleGenerativeAI(geminiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent(`Generate an engaging campus post about: ${prompt}`);

        // FIX: Correctly access the text response from the Gemini SDK.
        const response = result.response;
        return response.text().trim(); // Success.
      } catch (e) {
        console.error('Gemini post generation failed, falling back:', e.message || e);
      }
    }

    // --- Secondary Strategy: OpenAI ---
    if (apiKey) {
      try {
        const client = new OpenAI({ apiKey });
        const response = await client.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: `You are a campus social media assistant. Generate engaging posts.` },
            { role: "user", content: `Generate a campus post about: ${prompt}` }
          ],
          max_tokens: 300,
          temperature: 0.7
        });
        return response.choices[0].message.content.trim();
      } catch (error) {
        console.error('OpenAI post generation failed, falling back:', error);
      }
    }

    // --- Fallback Strategy: Heuristic Template ---
    return `📢 ${prompt}\n\nShare your thoughts and join the conversation below! #CampusLife`;
  }
}

module.exports = new OpenAIService();