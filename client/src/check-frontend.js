import api from '../config';

async function checkFrontend() {
    try {
        const response = await api.get('/cors-test');
        console.log('Frontend check response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Frontend check error:', error);
        throw error;
    }
}

export default checkFrontend; 