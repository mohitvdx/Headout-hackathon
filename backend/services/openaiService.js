const OpenAI = require('openai');

class OpenAIService {
  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      console.warn('OpenAI API key not found in environment variables. AI features will be disabled.');
      this.client = null;
      return;
    }
    
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async detectPostType(content) {
    if (!this.client) {
      throw new Error('OpenAI service not configured');
    }

    try {
      const response = await this.client.chat.completions.create({
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
      throw new Error('Failed to detect post type');
    }
  }

  async extractEntities(content, postType) {
    if (!this.client) {
      throw new Error('OpenAI service not configured');
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

      const response = await this.client.chat.completions.create({
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
        return {};
      }
    } catch (error) {
      console.error('Error extracting entities:', error);
      return {};
    }
  }

  async generatePost(prompt) {
    if (!this.client) {
      throw new Error('OpenAI service not configured');
    }

    try {
      const response = await this.client.chat.completions.create({
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
