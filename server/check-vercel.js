import fs from 'fs';
import path from 'path';

const checkVercel = () => {
  try {
    console.log('Checking Vercel configuration...');
    
    // Check if the vercel.json file exists
    const vercelConfigPath = path.join(process.cwd(), 'vercel.json');
    if (!fs.existsSync(vercelConfigPath)) {
      console.error('vercel.json file not found');
      return;
    }
    
    // Read the vercel.json file
    const vercelConfig = JSON.parse(fs.readFileSync(vercelConfigPath, 'utf8'));
    console.log('Vercel configuration:', vercelConfig);
    
    // Check if the headers are set correctly
    const headers = vercelConfig.headers || [];
    const corsHeader = headers.find(header => header.source === '/(.*)');
    
    if (!corsHeader) {
      console.error('CORS headers not found in vercel.json');
      return;
    }
    
    console.log('CORS headers:', corsHeader.headers);
    
    // Check if the origin is set correctly
    const originHeader = corsHeader.headers.find(header => header.key === 'Access-Control-Allow-Origin');
    if (!originHeader || originHeader.value !== 'https://quizspark-smoky.vercel.app') {
      console.error('Access-Control-Allow-Origin header is not set correctly');
      return;
    }
    
    console.log('Vercel configuration is valid');
  } catch (error) {
    console.error('Error checking Vercel configuration:', error);
  }
};

checkVercel(); 