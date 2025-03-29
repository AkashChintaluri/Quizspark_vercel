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

export const API_URL = getApiUrl(); 