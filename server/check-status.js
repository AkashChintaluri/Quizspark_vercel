import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const checkStatus = async () => {
  try {
    console.log('Checking Vercel deployment status...');
    
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
    
    // Check the deployment status
    try {
      const { stdout } = await execAsync('vercel list');
      console.log('Deployment status:', stdout);
    } catch (error) {
      console.error('Error checking deployment status:', error);
    }
  } catch (error) {
    console.error('Error checking Vercel deployment status:', error);
  }
};

checkStatus(); 