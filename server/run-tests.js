import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const runTests = async () => {
  try {
    console.log('Running Supabase check...');
    await execAsync('node check-supabase.js');
    
    console.log('\nWaiting for 1 second...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('\nRunning Express check...');
    await execAsync('node check-express.js');
    
    console.log('\nAll tests completed successfully!');
  } catch (error) {
    console.error('Error running tests:', error.message);
  }
};

runTests(); 