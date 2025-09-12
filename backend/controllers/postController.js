const openaiService = require('../services/openaiService');

class PostController {
  async detectPostType(req, res) {
    try {
      const { content, apiKey } = req.body;
      
      if (!content || !content.trim()) {
        return res.status(400).json({
          error: 'Content is required'
        });
      }

      if (!apiKey || !apiKey.trim()) {
        return res.status(400).json({
          error: 'API key is required'
        });
      }

      const postType = await openaiService.detectPostType(content, apiKey);
      
      res.json({
        success: true,
        data: {
          content,
          type: postType,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error in detectPostType:', error);
      res.status(500).json({
        error: error.message || 'Internal server error'
      });
    }
  }

  async generatePost(req, res) {
    try {
      const { prompt, apiKey } = req.body;
      
      if (!prompt || !prompt.trim()) {
        return res.status(400).json({
          error: 'Prompt is required'
        });
      }

      if (!apiKey || !apiKey.trim()) {
        return res.status(400).json({
          error: 'API key is required'
        });
      }

      const generatedContent = await openaiService.generatePost(prompt, apiKey);
      
      res.json({
        success: true,
        data: {
          generatedContent,
          originalPrompt: prompt,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error in generatePost:', error);
      res.status(500).json({
        error: error.message || 'Internal server error'
      });
    }
  }
}

module.exports = new PostController();
