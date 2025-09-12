const OpenAI = require('openai');

class OpenAIService {
  constructor() {
    // No persistent client; we will create per-request clients using provided API keys.
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

    if (!apiKey) {
      // Heuristic fallback
      return heuristic();
    }

    try {
      const client = new OpenAI({ apiKey });
      const response = await client.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are a post classifier for a campus social network. Analyze the given content and classify it into one of these THREE types ONLY:
            - "event": Posts about events, meetings, conferences, webinars, parties, study groups, workshops (look for dates, times, locations, RSVP mentions)
            - "lost_found": Posts about lost or found items on campus (look for "lost", "found", "missing", item descriptions, locations where lost/found)
            - "announcement": Official announcements from departments, news, important updates, deadlines, policy changes, administrative notices
            
            Respond with only the classification type in lowercase. If unsure, default to "announcement".`
          },
          {
            role: "user",
            content: content
          }
        ],
        max_tokens: 10,
        temperature: 0.1
      });

      const classification = response.choices[0].message.content.trim().toLowerCase();
      
      // Validate the response is one of our expected types
      const validTypes = ['event', 'lost_found', 'announcement'];
      if (validTypes.includes(classification)) {
        return classification;
      } else {
        return 'announcement'; // Default fallback
      }
    } catch (error) {
      console.error('Error detecting post type:', error);
      // Fallback to heuristic instead of failing hard
      return heuristic();
    }
  }

  async extractEntities(content, postType, apiKey) {
    const heuristic = () => {
      const text = content || '';
      if (postType === 'event') {
        const locationMatch = text.match(/at\s+([A-Za-z0-9 &,-]+)/i);
        const dateMatch = text.match(/\b(\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{2,4}|today|tomorrow)\b/i);
        return {
          title: undefined,
          location: locationMatch ? locationMatch[1].trim() : null,
          date: dateMatch ? dateMatch[0] : null,
        };
      }
      if (postType === 'lost_found') {
        const status = /\bfound\b/i.test(text) ? 'found' : (/\blost\b/i.test(text) ? 'lost' : null);
        const itemName = (text.match(/lost\s+(my\s+)?([^,\.]+)/i) || [])[2] || (text.match(/found\s+(a\s+|an\s+|the\s+)?([^,\.]+)/i) || [])[3] || null;
        const locationMatch = text.match(/near\s+([^,\.]+)/i) || text.match(/at\s+([^,\.]+)/i);
        return {
          itemStatus: status,
          itemName: itemName ? itemName.trim() : null,
          location: locationMatch ? locationMatch[1].trim() : null,
        };
      }
      if (postType === 'announcement') {
        const deptMatch = text.match(/from\s+the\s+([A-Za-z &]+)\s+department/i) || text.match(/\b([A-Za-z &]+)\s+department\b/i);
        const deadlineMatch = text.match(/deadline\s+(on\s+)?(\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{2,4}|tomorrow|today)/i);
        return {
          department: deptMatch ? deptMatch[1].trim() : null,
          deadline: deadlineMatch ? deadlineMatch[2] : null,
          priority: /urgent|asap|immediately/i.test(text) ? 'high' : 'medium',
        };
      }
      return {};
    };

    if (!apiKey) {
      // Heuristic extraction
      return heuristic();
    }

    try {
      let systemPrompt = '';
      
      switch (postType) {
        case 'event':
          systemPrompt = `Extract structured data from this event post. Return a JSON object with:
          {
            "date": "ISO date string if found",
            "location": "event location if mentioned",
            "title": "event title/name if mentioned"
          }
          If any field is not found, set it to null.`;
          break;
          
        case 'lost_found':
          systemPrompt = `Extract structured data from this lost/found post. Return a JSON object with:
          {
            "itemStatus": "lost" or "found",
            "itemName": "name/description of the item",
            "location": "where it was lost/found"
          }
          If any field is not found, set it to null.`;
          break;
          
        case 'announcement':
          systemPrompt = `Extract structured data from this announcement post. Return a JSON object with:
          {
            "department": "issuing department if mentioned",
            "deadline": "ISO date string if any deadline mentioned",
            "priority": "high", "medium", or "low" based on urgency indicators
          }
          If any field is not found, set it to null.`;
          break;
          
        default:
          return {};
      }

      const client = new OpenAI({ apiKey });
      const response = await client.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: content
          }
        ],
        max_tokens: 200,
        temperature: 0.1
      });

      try {
        return JSON.parse(response.choices[0].message.content.trim());
      } catch (parseError) {
        console.error('Error parsing extracted entities:', parseError);
        return heuristic();
      }
    } catch (error) {
      console.error('Error extracting entities:', error);
      return heuristic();
    }
  }

  async generatePost(prompt, apiKey) {
    if (!apiKey) {
      throw new Error('OpenAI API key not provided');
    }

    try {
      const client = new OpenAI({ apiKey });
      const response = await client.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are a campus social media assistant. Generate engaging posts for a campus feed. 
            The posts should be:
            - Appropriate for a campus community
            - Engaging and likely to generate meaningful interactions
            - Well-structured with proper formatting
            - Include relevant hashtags when appropriate
            - Be authentic and student/faculty-friendly
            
            Keep posts concise but impactful (100-250 words typically).`
          },
          {
            role: "user",
            content: `Generate a campus post about: ${prompt}`
          }
        ],
        max_tokens: 300,
        temperature: 0.7
      });

      return response.choices[0].message.content.trim();
    } catch (error) {
      console.error('Error generating post:', error);
      throw new Error('Failed to generate post');
    }
  }
}

module.exports = new OpenAIService();
