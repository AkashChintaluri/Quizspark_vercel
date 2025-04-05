import fetch from 'node-fetch';
import dns from 'dns';
import { promisify } from 'util';

const lookup = promisify(dns.lookup);

const checkNetwork = async () => {
  try {
    console.log('Checking network configuration...');
    
    // Check DNS resolution
    try {
      const { address } = await lookup('quizsparkbackend.vercel.app');
      console.log('DNS resolution for quizsparkbackend.vercel.app:', address);
    } catch (error) {
      console.error('Error resolving DNS for quizsparkbackend.vercel.app:', error);
    }
    
    try {
      const { address } = await lookup('quizspark-backend.vercel.app');
      console.log('DNS resolution for quizspark-backend.vercel.app:', address);
    } catch (error) {
      console.error('Error resolving DNS for quizspark-backend.vercel.app:', error);
    }
    
    // Check if the backend is accessible
    try {
      const response = await fetch('https://quizsparkbackend.vercel.app/');
      console.log('Backend is accessible:', response.status);
      console.log('Backend headers:', response.headers);
    } catch (error) {
      console.error('Error accessing backend:', error);
    }
    
    // Check if the backend with hyphen is accessible
    try {
      const response = await fetch('https://quizspark-backend.vercel.app/');
      console.log('Backend with hyphen is accessible:', response.status);
      console.log('Backend with hyphen headers:', response.headers);
    } catch (error) {
      console.error('Error accessing backend with hyphen:', error);
    }
  } catch (error) {
    console.error('Error checking network configuration:', error);
  }
};

checkNetwork(); 