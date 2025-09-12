const express = require('express');
const postController = require('../controllers/postController');

const router = express.Router();

// POST /api/posts/detect-type - Detect post type using AI
router.post('/detect-type', postController.detectPostType);

// POST /api/posts/generate - Generate post content using AI
router.post('/generate', postController.generatePost);

module.exports = router;
