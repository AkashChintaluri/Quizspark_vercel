// src/components/TeacherLogin.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';

function TeacherLogin() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isPressed, setIsPressed] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const navigate = useNavigate();

    const buttonStyle = {
        transform: isPressed ? 'scale(0.95)' : 'scale(1)',
        transition: 'transform 0.1s',
    };

    const handleMouseDown = () => setIsPressed(true);
    const handleMouseUp = () => setIsPressed(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/teacher-login', {
                username,
                password
            });

            if (response.data.success) {
                setShowPopup(true);
                setTimeout(() => {
                    setShowPopup(false);
                    navigate('/teacher-dashboard');
                }, 2000);
            } else {
                alert('Login failed. Please check your credentials.');
            }
        } catch (error) {
            console.error('Login error:', error.response?.data || error.message);
            alert(`An error occurred during login: ${error.response?.data?.error || error.message}`);
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
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password:</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="login-button"
                        style={buttonStyle}
                        onMouseDown={handleMouseDown}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                    >
                        Login
                    </button>
                </form>
            </div>
            {showPopup && (
                <div className="popup">
                    Login successful! Redirecting to dashboard...
                </div>
            )}
        </div>
    );
}

export default TeacherLogin;
