// Get the API URL from environment variables or use a default value
const getApiUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // In development, use localhost
  if (import.meta.env.DEV) {
    return 'http://localhost:3000';
  }
  
  // In production, use the backend URL
  return 'https://quizspark-backend.vercel.app';
};

// Create axios instance with default config
import axios from 'axios';

const api = axios.create({
  baseURL: getApiUrl(),
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const API_URL = getApiUrl();
export default api; 