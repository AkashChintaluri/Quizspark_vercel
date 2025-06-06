import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const checkVercelEnv = async () => {
  try {
    console.log('Checking Vercel environment variables...');
    
    // Check if the Vercel CLI is installed
    try {
      await execAsync('vercel --version');
      console.log('Vercel CLI is installed');
    } catch (error) {
      console.error('Vercel CLI is not installed');
      return;
    }
    
    // Check if the user is logged in
    try {
      await execAsync('vercel whoami');
      console.log('User is logged in to Vercel');
    } catch (error) {
      console.error('User is not logged in to Vercel');
      return;
    }
    
    // Check the environment variables for the frontend
    try {
      const { stdout } = await execAsync('vercel env ls quizspark-smoky.vercel.app');
      console.log('Frontend environment variables:', stdout);
    } catch (error) {
      console.error('Error checking frontend environment variables:', error);
    }
    
    // Check the environment variables for the backend
    try {
      const { stdout } = await execAsync('vercel env ls quizsparkbackend.vercel.app');
      console.log('Backend environment variables:', stdout);
    } catch (error) {
      console.error('Error checking backend environment variables:', error);
    }
  } catch (error) {
    console.error('Error checking Vercel environment variables:', error);
  }
};

checkVercelEnv(); 