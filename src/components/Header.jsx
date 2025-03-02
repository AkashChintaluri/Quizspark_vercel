// src/components/Header.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

function Header() {
    return (
        <header className="navbar">
            <div className="navbar-content">
                <Link to="/" className="title">QuizSpark</Link>
                <div className="buttons">
                    <Link to="/signup" className="button">Signup</Link>
                    <Link to="/student-login" className="button">Student Login</Link>
                    <Link to="/teacher-login" className="button">Teacher Login</Link>
                </div>
            </div>
        </header>
    );
}

export default Header;
