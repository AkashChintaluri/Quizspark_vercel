import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const checkSupabase = async () => {
  try {
    console.log('Checking Supabase connection...');
    console.log('Environment:', process.env.NODE_ENV);
    
    // Check if the Supabase URL and key are set
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
      console.error('Supabase URL or key is not set');
      console.log('Please set SUPABASE_URL and SUPABASE_KEY in your .env file');
      return;
    }
    
    console.log('Supabase URL:', process.env.SUPABASE_URL);
    console.log('Supabase key is set:', !!process.env.SUPABASE_KEY);
    
    // Create a Supabase client
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
    
    // Test the connection
    const { data, error } = await supabase.from('student_login').select('*').limit(1);
    
    if (error) {
      console.error('Supabase connection error:', error.message);
      console.error('Error details:', error);
    } else {
      console.log('Supabase connection successful');
      console.log('Data:', data);
    }
  } catch (error) {
    console.error('Error checking Supabase:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    }
  }
};

checkSupabase(); 