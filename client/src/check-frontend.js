import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const checkFrontend = async () => {
  try {
    console.log('Checking frontend configuration...');
    
    // Check if the API URL is set
    const apiUrl = process.env.NODE_ENV === 'production'
      ? 'https://quizspark-backend.vercel.app'
      : process.env.REACT_APP_API_URL || 'http://localhost:3002';
    
    console.log('API URL:', apiUrl);
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
    console.error('Error checking frontend:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    }
  }
};

checkFrontend(); 