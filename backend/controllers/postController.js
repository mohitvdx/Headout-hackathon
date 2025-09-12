const openaiService = require('../services/openaiService');
const Post = require('../models/Post');

class PostController {
  async detectPostType(req, res) {
    try {
      const { content } = req.body;
      
      if (!content || !content.trim()) {
        return res.status(400).json({
          error: 'Content is required'
        });
      }

      const postType = await openaiService.detectPostType(content);
      
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
      const { prompt } = req.body;
      
      if (!prompt || !prompt.trim()) {
        return res.status(400).json({
          error: 'Prompt is required'
        });
      }

      const generatedContent = await openaiService.generatePost(prompt);
      
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

  async createPost(req, res) {
    try {
      const { content, type, author = 'Anonymous User' } = req.body;
      
      if (!content || !content.trim()) {
        return res.status(400).json({
          error: 'Content is required'
        });
      }

      const post = new Post({
        content: content.trim(),
        type: type || 'text',
        author
      });

      const savedPost = await post.save();
      
      res.status(201).json({
        success: true,
        data: savedPost
      });
    } catch (error) {
      console.error('Error creating post:', error);
      res.status(500).json({
        error: error.message || 'Internal server error'
      });
    }
  }

  async getPosts(req, res) {
    try {
      const posts = await Post.find()
        .sort({ createdAt: -1 })
        .limit(50);
      
      res.json({
        success: true,
        data: posts
      });
    } catch (error) {
      console.error('Error fetching posts:', error);
      res.status(500).json({
        error: error.message || 'Internal server error'
      });
    }
  }

  async updateRSVP(req, res) {
    try {
      const { postId } = req.params;
      const { status } = req.body;
      
      if (!['going', 'maybe', 'notGoing'].includes(status)) {
        return res.status(400).json({
          error: 'Invalid RSVP status'
        });
      }

      const post = await Post.findById(postId);
      if (!post) {
        return res.status(404).json({
          error: 'Post not found'
        });
      }

      if (post.type !== 'event') {
        return res.status(400).json({
          error: 'RSVP only available for event posts'
        });
      }

      // Initialize metadata if it doesn't exist
      if (!post.metadata) {
        post.metadata = { rsvpCounts: { going: 0, maybe: 0, notGoing: 0 } };
      }
      if (!post.metadata.rsvpCounts) {
        post.metadata.rsvpCounts = { going: 0, maybe: 0, notGoing: 0 };
      }

      // Increment the RSVP count
      post.metadata.rsvpCounts[status] += 1;
      
      await post.save();
      
      res.json({
        success: true,
        data: post
      });
    } catch (error) {
      console.error('Error updating RSVP:', error);
      res.status(500).json({
        error: error.message || 'Internal server error'
      });
    }
  }
}

module.exports = new PostController();
