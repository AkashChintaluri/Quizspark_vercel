import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
// Use a different port for testing to avoid conflicts with the main server
const port = 3002;

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://quizspark-smoky.vercel.app'
    : 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Test endpoint
app.get('/cors-test', (req, res) => {
  console.log('CORS test endpoint hit');
  console.log('Request headers:', req.headers);
  res.json({ 
    message: 'CORS test successful',
    headers: req.headers
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Express error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start the server
app.listen(port, () => {
  console.log(`Test server is running on port ${port}`);
  console.log('CORS configuration:', {
    origin: process.env.NODE_ENV === 'production' 
      ? 'https://quizspark-smoky.vercel.app'
      : 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  });
}); 