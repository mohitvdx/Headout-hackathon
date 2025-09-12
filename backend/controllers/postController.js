const openaiService = require('../services/openaiService');
// DB removed: using in-memory only for demo
const mongoose = require('mongoose');

// In-memory fallback storage when MongoDB is not connected
let inMemoryPosts = [];
const isDbConnected = () => false; // force in-memory path

class PostController {
  async detectPostType(req, res) {
    try {
      const { content, apiKey } = req.body;

      if (!content || !content.trim()) {
        return res.status(400).json({
          error: 'Content is required'
        });
      }

      const postType = await openaiService.detectPostType(content, apiKey || process.env.OPENAI_API_KEY);
      const extractedEntities = await openaiService.extractEntities(content, postType, apiKey || process.env.OPENAI_API_KEY);

      res.json({
        success: true,
        data: {
          content,
          type: postType,
          extractedEntities,
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

      const generatedContent = await openaiService.generatePost(prompt, apiKey || process.env.OPENAI_API_KEY);

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
      const { content, type, author = 'Anonymous User', extractedEntities } = req.body;

      if (!content || !content.trim()) {
        return res.status(400).json({
          error: 'Content is required'
        });
      }

      const postData = {
        content: content.trim(),
        type: type || 'announcement',
        author,
        entities: extractedEntities || {},
        metadata: {}
      };

      // Add extracted entities to metadata based on post type
      if (extractedEntities) {
        switch (type) {
          case 'event':
            if (extractedEntities.date || extractedEntities.location || extractedEntities.title) {
              postData.metadata.eventDetails = {
                date: extractedEntities.date ? new Date(extractedEntities.date) : null,
                location: extractedEntities.location || null,
                title: extractedEntities.title || null
              };
            }
            postData.metadata.rsvpCounts = { going: 0, interested: 0, notGoing: 0 };
            break;

          case 'lost_found':
            if (extractedEntities.itemStatus || extractedEntities.itemName || extractedEntities.location) {
              postData.metadata.lostFoundDetails = {
                itemStatus: extractedEntities.itemStatus || null,
                itemName: extractedEntities.itemName || null,
                location: extractedEntities.location || null
              };
            }
            break;

          case 'announcement':
            if (extractedEntities.department || extractedEntities.deadline || extractedEntities.priority) {
              postData.metadata.announcementDetails = {
                department: extractedEntities.department || null,
                deadline: extractedEntities.deadline ? new Date(extractedEntities.deadline) : null,
                priority: extractedEntities.priority || 'medium'
              };
            }
            break;
        }
      }

      if (!isDbConnected()) {
        const mockPost = {
          _id: new mongoose.Types.ObjectId().toString(),
          ...postData,
          metadata: postData.metadata || {},
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        inMemoryPosts.unshift(mockPost);
        return res.status(201).json({ success: true, data: mockPost });
      }
      // unreachable with in-memory only
    } catch (error) {
      console.error('Error creating post:', error);
      res.status(500).json({
        error: error.message || 'Internal server error'
      });
    }
  }

  async getPosts(req, res) {
    try {
      return res.json({ success: true, data: inMemoryPosts.slice(0, 50) });
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

      if (!['going', 'interested', 'notGoing'].includes(status)) {
        return res.status(400).json({
          error: 'Invalid RSVP status'
        });
      }

      if (!isDbConnected()) {
        const idx = inMemoryPosts.findIndex(p => p._id === postId);
        if (idx === -1) {
          return res.status(404).json({ error: 'Post not found' });
        }
        const post = inMemoryPosts[idx];
        if (post.type !== 'event') {
          return res.status(400).json({ error: 'RSVP only available for event posts' });
        }
        post.metadata = post.metadata || {};
        post.metadata.rsvpCounts = post.metadata.rsvpCounts || { going: 0, interested: 0, notGoing: 0 };
        post.metadata.rsvpCounts[status] = (post.metadata.rsvpCounts[status] || 0) + 1;
        post.updatedAt = new Date();
        inMemoryPosts[idx] = post;
        return res.json({ success: true, data: post });
      }

      // unreachable with in-memory only
    } catch (error) {
      console.error('Error updating RSVP:', error);
      res.status(500).json({
        error: error.message || 'Internal server error'
      });
    }
  }
}

module.exports = new PostController();
