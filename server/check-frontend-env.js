import fs from 'fs';
import path from 'path';

const checkFrontendEnv = () => {
  try {
    console.log('Checking frontend environment variables...');
    
    // Check if the .env file exists
    const envPath = path.join(process.cwd(), '..', '.env');
    if (fs.existsSync(envPath)) {
      console.log('Frontend .env file exists');
      
      // Read the .env file
      const envContent = fs.readFileSync(envPath, 'utf8');
      console.log('Frontend .env content:', envContent);
      
      // Check if the VITE_API_URL is set
      if (envContent.includes('VITE_API_URL')) {
        console.log('VITE_API_URL is set in the frontend .env file');
        
        // Extract the VITE_API_URL value
        const apiUrlMatch = envContent.match(/VITE_API_URL=(.*)/);
        if (apiUrlMatch) {
          console.log('VITE_API_URL value:', apiUrlMatch[1]);
        }
      } else {
        console.log('VITE_API_URL is not set in the frontend .env file');
      }
    } else {
      console.log('Frontend .env file does not exist');
    }
    
    // Check if the .env.production file exists
    const envProdPath = path.join(process.cwd(), '..', '.env.production');
    if (fs.existsSync(envProdPath)) {
      console.log('Frontend .env.production file exists');
      
      // Read the .env.production file
      const envProdContent = fs.readFileSync(envProdPath, 'utf8');
      console.log('Frontend .env.production content:', envProdContent);
      
      // Check if the VITE_API_URL is set
      if (envProdContent.includes('VITE_API_URL')) {
        console.log('VITE_API_URL is set in the frontend .env.production file');
        
        // Extract the VITE_API_URL value
        const apiUrlMatch = envProdContent.match(/VITE_API_URL=(.*)/);
        if (apiUrlMatch) {
          console.log('VITE_API_URL value:', apiUrlMatch[1]);
        }
      } else {
        console.log('VITE_API_URL is not set in the frontend .env.production file');
      }
    } else {
      console.log('Frontend .env.production file does not exist');
    }
  } catch (error) {
    console.error('Error checking frontend environment variables:', error);
  }
};

checkFrontendEnv(); 