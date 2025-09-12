const OpenAI = require('openai');

class OpenAIService {
  constructor() {
    // We'll create clients dynamically with API keys from requests
  }

  createClient(apiKey) {
    if (!apiKey) {
      throw new Error('OpenAI API key is required');
    }
    return new OpenAI({
      apiKey: apiKey,
    });
  }

  async detectPostType(content, apiKey) {
    const client = this.createClient(apiKey);

    try {
      const response = await client.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are a post classifier for a professional social network. Analyze the given content and classify it into one of these types:
            - "text": General text posts, thoughts, opinions, updates
            - "event": Posts about events, meetings, conferences, webinars (look for dates, times, locations, RSVP mentions)
            - "poll": Posts asking for opinions, votes, or choices (look for questions with options)
            - "announcement": Official announcements, news, product launches, company updates
            - "job": Job postings, hiring announcements, career opportunities
            - "achievement": Celebrating accomplishments, milestones, awards, promotions
            
            Respond with only the classification type in lowercase.`
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
      const validTypes = ['text', 'event', 'poll', 'announcement', 'job', 'achievement'];
      if (validTypes.includes(classification)) {
        return classification;
      } else {
        return 'text'; // Default fallback
      }
    } catch (error) {
      console.error('Error detecting post type:', error);
      throw new Error('Failed to detect post type');
    }
  }

  async generatePost(prompt, apiKey) {
    const client = this.createClient(apiKey);

    try {
      const response = await client.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are a professional social media assistant. Generate engaging, professional posts for LinkedIn-style platforms. 
            The posts should be:
            - Professional and appropriate for a business network
            - Engaging and likely to generate meaningful interactions
            - Well-structured with proper formatting
            - Include relevant hashtags when appropriate
            - Be authentic and human-like
            
            Keep posts concise but impactful (150-300 words typically).`
          },
          {
            role: "user",
            content: `Generate a professional post about: ${prompt}`
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
