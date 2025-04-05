import React, { useState, useEffect } from 'react';
import api from '../config';
import './Login.css';

function CorsTest() {
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [requestInfo, setRequestInfo] = useState(null);

    const testCors = async () => {
        setLoading(true);
        setError(null);
        setRequestInfo({
            url: api.defaults.baseURL + '/cors-test',
            method: 'GET',
            headers: api.defaults.headers,
            withCredentials: api.defaults.withCredentials
        });
        
        try {
            const response = await api.get('/cors-test');
            setResult(response.data);
            console.log('CORS test successful:', response.data);
        } catch (err) {
            const errorDetails = {
                message: err.message || 'Failed to test CORS',
                code: err.code,
                name: err.name,
                response: err.response ? {
                    status: err.response.status,
                    statusText: err.response.statusText,
                    headers: err.response.headers
                } : null,
                request: err.request ? {
                    method: err.request.__METHOD__,
                    url: err.request.__URL__
                } : null
            };
            setError(errorDetails);
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

                {requestInfo && (
                    <div className="info-message">
                        <h3>Request Info:</h3>
                        <pre>{JSON.stringify(requestInfo, null, 2)}</pre>
                    </div>
                )}

                {error && (
                    <div className="error-message">
                        <h3>Error:</h3>
                        <pre>{JSON.stringify(error, null, 2)}</pre>
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