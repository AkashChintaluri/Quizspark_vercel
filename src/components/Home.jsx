// src/components/Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css'; // Don't forget to create this CSS file

function Home() {
    return (
        <div className="home">
            <div className="content">
                <header className="home-header">
                    <h1>Welcome to BuzzQuiz</h1>
                    <p>The Ultimate Quiz Platform for Students and Teachers</p>
                </header>

                <main className="home-main">
                    <section className="features">
                        <h2>Why Choose BuzzQuiz?</h2>
                        <ul>
                            <li>Interactive and engaging quizzes</li>
                            <li>Easy-to-use interface for both students and teachers</li>
                            <li>Real-time results and feedback</li>
                            <li>Customizable quiz options</li>
                        </ul>
                    </section>

                    <section className="cta">
                        <h2>Get Started Today</h2>
                        <div className="cta-buttons">
                            <Link to="/student-login" className="cta-button student">Student Login</Link>
                            <Link to="/teacher-login" className="cta-button teacher">Teacher Login</Link>
                        </div>
                    </section>
                </main>

                <footer className="home-footer">
                    <p>&copy; 2025 BuzzQuiz. All rights reserved.</p>
                </footer>
            </div>
        </div>
    );
}

export default Home;
