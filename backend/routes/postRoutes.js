const express = require('express');
const postController = require('../controllers/postController');

const router = express.Router();

// POST /api/posts/detect-type - Detect post type using AI
router.post('/detect-type', postController.detectPostType);

// POST /api/posts/generate - Generate post content using AI
router.post('/generate', postController.generatePost);

// POST /api/posts - Create a new post
router.post('/', postController.createPost);

// GET /api/posts - Get all posts
router.get('/', postController.getPosts);

// PUT /api/posts/:postId/rsvp - Update RSVP for event posts
router.put('/:postId/rsvp', postController.updateRSVP);

module.exports = router;
