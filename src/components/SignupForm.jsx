// src/components/SignupForm.jsx
import { useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import axios from 'axios';
import './SignupForm.css';

function SignupForm() {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [userType, setUserType] = useState('student');
    const [isPressed, setIsPressed] = useState(false);
    const [showPopup, setShowPopup] = useState(false);

    const buttonStyle = {
        transform: isPressed ? 'scale(0.95)' : 'scale(1)',
        transition: 'transform 0.1s',
    };

    const handleMouseDown = () => setIsPressed(true);
    const handleMouseUp = () => setIsPressed(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/signup', {
                username,
                email,
                password,
                userType
            });
            console.log(response.data);
            // Redirect to the appropriate login page
            navigate(userType === 'student' ? '/student-login' : '/teacher-login');
        } catch (error) {
            console.error('Signup error:', error.response?.data?.error || 'An error occurred');
            alert('Signup failed. Please try again.');
        }
    };

    return (
        <div className="signup-container">
            <div className="signup-form-wrapper">
                <h2>Sign Up</h2>
                <form className="signup-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email:</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
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
                    <div className="form-group">
                        <label htmlFor="userType">I am a:</label>
                        <select
                            id="userType"
                            value={userType}
                            onChange={(e) => setUserType(e.target.value)}
                        >
                            <option value="student">Student</option>
                            <option value="teacher">Teacher</option>
                        </select>
                    </div>
                    <button
                        type="submit"
                        className="signup-button"
                        style={buttonStyle}
                        onMouseDown={handleMouseDown}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                    >
                        Sign Up
                    </button>
                </form>
            </div>
            {showPopup && (
                <div className="popup">
                    Account has been created successfully!
                </div>
            )}
        </div>
    );
}

export default SignupForm;
