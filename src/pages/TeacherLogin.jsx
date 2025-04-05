import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../config';
import './Login.css';

function TeacherLogin() {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await api.post('/login', {
                ...formData,
                userType: 'teacher'
            });

            if (response.data.user) {
                localStorage.setItem('user', JSON.stringify(response.data.user));
                navigate('/teacher-dashboard');
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Login failed');
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    return (
        <div className="login">
            <div className="login-content">
                <h2>Teacher Login</h2>
                {error && <div className="error-message">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            placeholder="Username"
                        />
                    </div>
                    <div className="form-group">
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            placeholder="Password"
                        />
                    </div>
                    <button type="submit">Login</button>
                </form>
            </div>
        </div>
    );
}

export default TeacherLogin;
