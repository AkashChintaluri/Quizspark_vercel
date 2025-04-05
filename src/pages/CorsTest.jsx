import React, { useState, useEffect } from 'react';
import api from '../config';
import './Login.css';

function CorsTest() {
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const testCors = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get('/cors-test');
            setResult(response.data);
            console.log('CORS test successful:', response.data);
        } catch (err) {
            setError(err.message || 'Failed to test CORS');
            console.error('CORS test failed:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login">
            <div className="login-content">
                <h2>CORS Test</h2>
                <button 
                    onClick={testCors} 
                    className="login-button"
                    disabled={loading}
                >
                    {loading ? 'Testing...' : 'Test CORS'}
                </button>

                {error && (
                    <div className="error-message">
                        <h3>Error:</h3>
                        <pre>{error}</pre>
                    </div>
                )}

                {result && (
                    <div className="success-message">
                        <h3>Success:</h3>
                        <pre>{JSON.stringify(result, null, 2)}</pre>
                    </div>
                )}
            </div>
        </div>
    );
}

export default CorsTest; 