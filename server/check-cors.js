import fetch from 'node-fetch';

const checkCors = async () => {
  try {
    console.log('Checking CORS configuration...');
    
    // Check the CORS test endpoint
    const corsResponse = await fetch('https://quizsparkbackend.vercel.app/cors-test', {
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://quizspark-smoky.vercel.app',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type, Authorization'
      }
    });
    
    console.log('CORS preflight status:', corsResponse.status);
    console.log('CORS preflight headers:', corsResponse.headers);
    
    // Check the CORS test endpoint with a GET request
    const getResponse = await fetch('https://quizsparkbackend.vercel.app/cors-test', {
      method: 'GET',
      headers: {
        'Origin': 'https://quizspark-smoky.vercel.app'
      }
    });
    
    console.log('CORS GET status:', getResponse.status);
    console.log('CORS GET headers:', getResponse.headers);
    
    // Check the signup endpoint with a POST request
    const postResponse = await fetch('https://quizsparkbackend.vercel.app/signup', {
      method: 'POST',
      headers: {
        'Origin': 'https://quizspark-smoky.vercel.app',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'test',
        email: 'test@example.com',
        password: 'test',
        userType: 'student'
      })
    });
    
    console.log('Signup POST status:', postResponse.status);
    console.log('Signup POST headers:', postResponse.headers);
  } catch (error) {
    console.error('Error checking CORS configuration:', error);
  }
};

checkCors(); 