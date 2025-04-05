import fetch from 'node-fetch';

const checkDeployment = async () => {
  try {
    console.log('Checking Vercel deployment...');
    
    // Check the main endpoint
    const mainResponse = await fetch('https://quizspark-backend.vercel.app/');
    console.log('Main endpoint status:', mainResponse.status);
    console.log('Main endpoint headers:', mainResponse.headers);
    
    // Check the CORS test endpoint
    const corsResponse = await fetch('https://quizspark-backend.vercel.app/cors-test', {
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://quizspark-smoky.vercel.app',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type, Authorization'
      }
    });
    
    console.log('CORS preflight status:', corsResponse.status);
    console.log('CORS preflight headers:', corsResponse.headers);
    
    // Check if the backend is using Supabase
    const dbResponse = await fetch('https://quizspark-backend.vercel.app/test-db');
    console.log('Database test status:', dbResponse.status);
    
    if (dbResponse.ok) {
      const dbData = await dbResponse.json();
      console.log('Database test data:', dbData);
    }
  } catch (error) {
    console.error('Error checking Vercel deployment:', error);
  }
};

checkDeployment(); 