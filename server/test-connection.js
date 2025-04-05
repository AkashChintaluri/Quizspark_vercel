import fetch from 'node-fetch';

const testBackend = async () => {
  try {
    console.log('Testing connection to backend...');
    const response = await fetch('https://quizspark-backend.vercel.app/');
    const data = await response.json();
    console.log('Backend is accessible:', data);
    
    console.log('\nTesting CORS headers...');
    const corsResponse = await fetch('https://quizspark-backend.vercel.app/cors-test', {
      method: 'GET',
      headers: {
        'Origin': 'https://quizspark-smoky.vercel.app',
        'Accept': 'application/json'
      }
    });
    
    console.log('CORS test response status:', corsResponse.status);
    console.log('CORS headers:', corsResponse.headers);
    
    const corsData = await corsResponse.json();
    console.log('CORS test data:', corsData);
  } catch (error) {
    console.error('Error testing backend:', error);
  }
};

testBackend(); 