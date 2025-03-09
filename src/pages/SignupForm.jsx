import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './SignupForm.css';

function SignupForm() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        userType: 'student'
    });
    const [isPressed, setIsPressed] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Auto-hide popup after 3 seconds
    useEffect(() => {
        if (showPopup) {
            const timer = setTimeout(() => setShowPopup(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [showPopup]);

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await axios.post('http://localhost:3000/signup', formData);

            setShowPopup(true);
            console.log('Signup successful:', response.data);

            // Redirect after short delay for better UX
            setTimeout(() => {
                navigate(formData.userType === 'student'
                    ? '/student-login'
                    : '/teacher-login');
            }, 1500);

        } catch (error) {
            const errorMessage = error.response?.data?.error ||
                'Registration failed. Please try again.';
            alert(errorMessage);
            console.error('Signup error:', error);
        } finally {
            setIsLoading(false);
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
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            autoComplete="email"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="username">Username:</label>
                        <input
                            type="text"
                            id="username"
                            value={formData.username}
                            onChange={handleInputChange}
                            required
                            autoComplete="username"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password:</label>
                        <input
                            type="password"
                            id="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            required
                            autoComplete="new-password"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="userType">I am a:</label>
                        <select
                            id="userType"
                            value={formData.userType}
                            onChange={handleInputChange}
                        >
                            <option value="student">Student</option>
                            <option value="teacher">Teacher</option>
                        </select>
                    </div>
                    <button
                        type="submit"
                        className="signup-button"
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
                        {isLoading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>
            </div>

            {showPopup && (
                <div className="popup success">
                    ✅ Account created successfully! Redirecting to login...
                </div>
            )}
        </div>
    );
}

export default SignupForm;
