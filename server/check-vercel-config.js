import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const checkVercelConfig = async () => {
  try {
    console.log('Checking Vercel deployment configuration...');
    
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
    
    // Check the deployment configuration for the frontend
    try {
      const { stdout } = await execAsync('vercel inspect quizspark-smoky.vercel.app');
      console.log('Frontend deployment configuration:', stdout);
    } catch (error) {
      console.error('Error checking frontend deployment configuration:', error);
    }
    
    // Check the deployment configuration for the backend
    try {
      const { stdout } = await execAsync('vercel inspect quizsparkbackend.vercel.app');
      console.log('Backend deployment configuration:', stdout);
    } catch (error) {
      console.error('Error checking backend deployment configuration:', error);
    }
  } catch (error) {
    console.error('Error checking Vercel deployment configuration:', error);
  }
};

checkVercelConfig(); 