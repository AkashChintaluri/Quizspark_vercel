import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';

function TeacherLogin() {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [isPressed, setIsPressed] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (showPopup) {
            const timer = setTimeout(() => {
                setShowPopup(false);
                navigate('/teacher-dashboard');
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [showPopup, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMessage('');

        try {
            const response = await axios.post('http://localhost:3000/login', {
                ...formData,
                userType: 'teacher'
            });

            if (response.data.success) {
                localStorage.setItem('user', JSON.stringify(response.data.user));
                setShowPopup(true);
            } else {
                setErrorMessage('Invalid username or password');
            }
        } catch (error) {
            const serverError = error.response?.data?.error || error.message;
            setErrorMessage(serverError || 'Login failed. Please try again.');
            console.error('Login error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-form-wrapper">
                <h2>Teacher Login</h2>
                <form className="login-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="username">Username:</label>
                        <input
                            type="text"
                            id="username"
                            value={formData.username}
                            onChange={(e) => setFormData({...formData, username: e.target.value})}
                            required
                            autoComplete="username"
                            disabled={isLoading}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password:</label>
                        <input
                            type="password"
                            id="password"
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                            required
                            autoComplete="current-password"
                            disabled={isLoading}
                        />
                    </div>

                    {errorMessage && <div className="error-message">{errorMessage}</div>}

                    <button
                        type="submit"
                        className="login-button"
                        style={{
                            transform: isPressed ? 'scale(0.95)' : 'scale(1)',
                            transition: 'transform 0.1s',
                            opacity: isLoading ? 0.7 : 1
                        }}
                        onMouseDown={() => setIsPressed(true)}
                        onMouseUp={() => setIsPressed(false)}
                        onMouseLeave={() => setIsPressed(false)}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Logging In...' : 'Login'}
                    </button>
                </form>
            </div>

            {showPopup && (
                <div className="popup success">
                    ✔️ Login successful! Redirecting to dashboard...
                </div>
            )}
        </div>
    );
}

export default TeacherLogin;
