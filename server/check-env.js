import dotenv from 'dotenv';

dotenv.config();

const checkEnv = () => {
  try {
    console.log('Checking environment variables...');
    
    // Check if the Supabase URL and key are set
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
      console.error('Supabase URL or key is not set');
      return;
    }
    
    console.log('Supabase URL:', process.env.SUPABASE_URL);
    console.log('Supabase key is set:', !!process.env.SUPABASE_KEY);
    
    // Check if the API URL is set
    if (!process.env.API_URL) {
      console.error('API URL is not set');
      return;
    }
    
    console.log('API URL:', process.env.API_URL);
    
    // Check if the frontend URL is set
    if (!process.env.FRONTEND_URL) {
      console.error('Frontend URL is not set');
      return;
    }
    
    console.log('Frontend URL:', process.env.FRONTEND_URL);
    
    console.log('Environment variables are valid');
  } catch (error) {
    console.error('Error checking environment variables:', error);
  }
};

checkEnv(); 