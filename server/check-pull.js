import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const checkPull = async () => {
  try {
    console.log('Checking Vercel deployment pull...');
    
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
    
    // Check the deployment pull
    try {
      const { stdout } = await execAsync('vercel pull');
      console.log('Deployment pull:', stdout);
    } catch (error) {
      console.error('Error checking deployment pull:', error);
    }
  } catch (error) {
    console.error('Error checking Vercel deployment pull:', error);
  }
};

checkPull(); 