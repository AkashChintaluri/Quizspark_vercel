import fs from 'fs';
import path from 'path';

const checkVercelConfig = () => {
  try {
    console.log('Checking Vercel configuration...');
    
    // Read the vercel.json file
    const vercelConfigPath = path.join(process.cwd(), 'vercel.json');
    const vercelConfig = JSON.parse(fs.readFileSync(vercelConfigPath, 'utf8'));
    
    console.log('Vercel configuration:', vercelConfig);
    
    // Check if the configuration is valid
    if (vercelConfig.headers && vercelConfig.rewrites) {
      console.log('Vercel configuration is valid (has headers and rewrites)');
    } else {
      console.log('Vercel configuration is invalid (missing headers or rewrites)');
    }
    
    // Check if the CORS headers are properly configured
    const corsHeaders = vercelConfig.headers.find(h => h.source === '/(.*)');
    if (corsHeaders) {
      console.log('CORS headers are configured:', corsHeaders.headers);
      
      // Check if the Access-Control-Allow-Origin header is set correctly
      const originHeader = corsHeaders.headers.find(h => h.key === 'Access-Control-Allow-Origin');
      if (originHeader && originHeader.value === 'https://quizspark-smoky.vercel.app') {
        console.log('Access-Control-Allow-Origin header is set correctly');
      } else {
        console.log('Access-Control-Allow-Origin header is not set correctly');
      }
    } else {
      console.log('CORS headers are not configured');
    }
  } catch (error) {
    console.error('Error checking Vercel configuration:', error);
  }
};

checkVercelConfig(); 