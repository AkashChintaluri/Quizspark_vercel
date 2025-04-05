import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';

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

const checkExpress = async () => {
    try {
        console.log('Checking Express server configuration...');

        const apiUrl = process.env.NODE_ENV === 'production'
            ? 'https://quizsparkbackend.vercel.app'
            : process.env.API_URL || 'http://localhost:3000';

        const frontendUrl = process.env.NODE_ENV === 'production'
            ? 'https://quizspark-smoky.vercel.app'
            : process.env.FRONTEND_URL || 'http://localhost:3000';

        console.log('API URL:', apiUrl);
        console.log('Frontend URL:', frontendUrl);
        console.log('Environment:', process.env.NODE_ENV);

        // Test the API connection
        const response = await axios.get(`${apiUrl}/cors-test`, {
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log('API connection successful');
        console.log('Response:', response.data);
    } catch (error) {
        console.error('Error checking Express server:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response headers:', error.response.headers);
        }
    }
};

checkExpress(); 