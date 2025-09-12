const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Database removed for demo: using in-memory storage only
const postRoutes = require('./routes/postRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// No database connection – in-memory only

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'LinkedIn-like Post API Server' });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/posts', postRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
