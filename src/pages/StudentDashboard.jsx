import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './StudentDashboard.css';
import './TakeQuiz.css';
import TeacherList from './TeacherList';

const API_BASE_URL = 'http://localhost:3000/api';

function StudentDashboard() {
    const [activeTab, setActiveTab] = useState('home');
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            navigate('/');
            return;
        }

        try {
            const parsedUser = JSON.parse(storedUser);
            if (parsedUser?.id) {
                setCurrentUser(parsedUser);
            } else {
                console.warn('User data missing "id" property, redirecting to login.');
                localStorage.removeItem('user');
                navigate('/');
            }
        } catch (error) {
            console.error('Error parsing user data:', error);
            localStorage.removeItem('user');
            navigate('/');
            return;
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    if (loading) {
        return <div className="loading-screen">Loading dashboard...</div>;
    }

    return (
        <div className="student-dashboard">
            {currentUser ? (
                <>
                    <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} currentUser={currentUser} />
                    <Content activeTab={activeTab} setActiveTab={setActiveTab} currentUser={currentUser} />
                </>
            ) : (
                <div className="auth-message">Session expired. Redirecting to login...</div>
            )}
        </div>
    );
}

function Sidebar({ activeTab, setActiveTab, currentUser }) {
    return (
        <div className="sidebar">
            <h2>Student Dashboard</h2>
            {currentUser && (
                <div className="welcome-box">
                    <p>Welcome, {currentUser.username}!</p>
                </div>
            )}
            <nav>
                <ul>
                    {['Home', 'Take Quiz', 'Results', 'Settings'].map((tab) => (
                        <li key={tab}>
                            <button
                                className={activeTab === tab ? 'active' : ''}
                                onClick={() => setActiveTab(tab)}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>
        </div>
    );
}

function Content({ activeTab, setActiveTab, currentUser }) {
    switch (activeTab) {
        case 'Home':
            return <HomeContent currentUser={currentUser} />;
        case 'Take Quiz':
            return <TakeQuizContent currentUser={currentUser} setActiveTab={setActiveTab} />;
        case 'Results':
            return <ResultsContent currentUser={currentUser} />;
        case 'Settings':
            return <SettingsContent currentUser={currentUser} />;
        default:
            return <HomeContent currentUser={currentUser} />;
    }
}

function HomeContent({ currentUser }) {
    const [upcomingQuizzes, setUpcomingQuizzes] = useState([]);
    const [subscriptions, setSubscriptions] = useState([]);
    const [stats, setStats] = useState({
        totalAttempts: 0,
        averageScore: 0,
        completedQuizzes: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchHomeData = async () => {
            setLoading(true);
            setError('');
            try {
                if (!currentUser?.id) {
                    throw new Error('Invalid user session');
                }

                // Parallelize the API calls using Promise.all
                const [quizzesResponse, statsResponse, subscriptionsResponse] = await Promise.all([
                    axios.get(`${API_BASE_URL}/upcoming-quizzes/${currentUser.id}`),
                    axios.get(`${API_BASE_URL}/user-stats/${currentUser.id}`),
                    axios.get(`${API_BASE_URL}/subscriptions/${currentUser.id}`)
                ]);

                setUpcomingQuizzes(quizzesResponse.data);
                setStats(statsResponse.data);
                setSubscriptions(subscriptionsResponse.data);

            } catch (err) {
                console.error('Error fetching home data:', err);
                if (err.code === 'ERR_NETWORK') {
                    setError('Unable to connect to the server. Please check your connection or try again later.');
                } else {
                    setError('Failed to load dashboard data. Please try again later.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchHomeData();
    }, [currentUser?.id]);

    if (loading) {
        return (
            <div className="content">
                <h2>Loading dashboard data...</h2>
            </div>
        );
    }

    return (
        <div className="content home-content">
            {error ? (
                <div className="error-message">{error}</div>
            ) : (
                <>
                    <h2>Welcome, {currentUser?.username}!</h2>

                    <div className="stats-section">
                        <h3>Your Statistics</h3>
                        <div className="stats-grid">
                            <div className="stat-card">
                                <h4>Total Attempts</h4>
                                <p>{stats.totalAttempts}</p>
                            </div>
                            <div className="stat-card">
                                <h4>Average Score</h4>
                                <p>{(stats.averageScore || 0).toFixed(1)}%</p>
                            </div>
                            <div className="stat-card">
                                <h4>Completed Quizzes</h4>
                                <p>{stats.completedQuizzes}</p>
                            </div>
                        </div>
                    </div>

                    <div className="upcoming-quizzes">
                        <h3>Upcoming Quizzes</h3>
                        {upcomingQuizzes.length === 0 ? (
                            <p>No upcoming quizzes from your subscribed teachers.</p>
                        ) : (
                            upcomingQuizzes.map((quiz) => (
                                <div key={quiz.quiz_id} className="quiz-card">
                                    <h4>{quiz.quiz_name}</h4>
                                    <p>Code: {quiz.quiz_code}</p>
                                    <p>Teacher: {quiz.teacher_name}</p>
                                    <p>Due Date: {new Date(quiz.due_date).toLocaleDateString()}</p>
                                </div>
                            ))
                        )}
                    </div>

                    <TeacherList studentId={currentUser?.id} />
                </>
            )}
        </div>
    );
}

function TakeQuizContent({ currentUser, setActiveTab }) {
    const [quizCode, setQuizCode] = useState('');
    const [quizData, setQuizData] = useState(null);
    const [error, setError] = useState('');
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [showQuizCodeInput, setShowQuizCodeInput] = useState(true);
    const [submissionResult, setSubmissionResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleQuizCodeSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmissionResult(null);

        if (!quizCode.trim()) {
            setError('Please enter a quiz code.');
            return;
        }

        setLoading(true);
        try {
            if (!currentUser?.id) {
                throw new Error('User not authenticated');
            }

            const attemptCheckResponse = await axios.get(`${API_BASE_URL}/check-quiz-attempt/${quizCode}/${currentUser.id}`);

            if (attemptCheckResponse.status !== 200) {
                throw new Error(`Failed to check quiz attempt: ${attemptCheckResponse.status}`);
            }

            const attemptCheckData = attemptCheckResponse.data;

            if (attemptCheckData.hasAttempted) {
                setError(attemptCheckData.message);
                setQuizData(null);
                setShowQuizCodeInput(true);
                return;
            }

            const response = await axios.get(`${API_BASE_URL}/quizzes/${quizCode}`);

            if (response.status !== 200) {
                throw new Error(`Failed to fetch quiz. Status: ${response.status}`);
            }

            const data = response.data;
            setQuizData(data);
            setShowQuizCodeInput(false);
        } catch (err) {
            console.error('Error fetching quiz:', err);
            setError(err.message || 'An error occurred while fetching the quiz.');
            setQuizData(null);
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerChange = (questionIndex, optionIndex) => {
        setSelectedAnswers(prevAnswers => {
            const newAnswers = { ...prevAnswers };
            if (newAnswers[questionIndex] === optionIndex) {
                delete newAnswers[questionIndex];
            } else {
                newAnswers[questionIndex] = optionIndex;
            }
            return newAnswers;
        });
    };

    const handleSubmitQuiz = async () => {
        setLoading(true);
        try {
            if (!currentUser?.id) {
                throw new Error('User not authenticated');
            }

            const response = await axios.post(`${API_BASE_URL}/submit-quiz`, {
                quiz_code: quizCode,
                user_id: currentUser.id,
                answers: selectedAnswers,
            });
            if (response.status !== 201) {
                throw new Error(response.data.message || 'Failed to submit quiz. Please try again.');
            }

            setSubmissionResult(response.data);
            setActiveTab('Results');
        } catch (error) {
            console.error('Error submitting quiz:', error);
            setError(error.message || 'An error occurred while submitting the quiz');
        } finally {
            setLoading(false);
        }
    };

    const renderQuiz = () => {
        if (!quizData || !quizData.questions) {
            return <p>No quiz data available.</p>;
        }
        return (
            <div className="quiz-container">
                <h2 className="quiz-title">{quizData.quiz_name}</h2>
                <div className="question-list">
                    {quizData.questions.questions.map((question, index) => (
                        <div key={index} className="question-card">
                            <h3 className="question-number">Question {index + 1}</h3>
                            <p className="question-text">{question.question_text}</p>
                            <div className="options-container">
                                {question.options.map((option, optionIndex) => (
                                    <div key={optionIndex} className="option-item">
                                        <label className={selectedAnswers[index] === optionIndex ? 'selected' : ''}>
                                            <input
                                                type="radio"
                                                name={`question_${index}`}
                                                value={optionIndex}
                                                checked={selectedAnswers[index] === optionIndex}
                                                onChange={() => handleAnswerChange(index, optionIndex)}
                                            />
                                            <span className="option-text">{option.text}</span>
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
                <button className="submit-quiz-btn" onClick={handleSubmitQuiz} disabled={loading}>
                    {loading ? 'Submitting...' : 'Submit Quiz'}
                </button>
            </div>
        );
    };

    if (submissionResult) {
        return (
            <ResultsContent
                quizData={quizData}
                results={submissionResult}
                selectedAnswers={selectedAnswers}
                currentUser={currentUser}
            />
        );
    }

    return (
        <div className="content">
            <div className="take-quiz-content">
                {showQuizCodeInput && (
                    <>
                        <div className="header-section">
                            <h2>Take Quiz</h2>
                        </div>
                        <div className="quiz-code-section">
                            <form onSubmit={handleQuizCodeSubmit}>
                                <input
                                    type="text"
                                    placeholder="Enter Quiz Code"
                                    value={quizCode}
                                    onChange={(e) => setQuizCode(e.target.value)}
                                    className="quiz-code-input"
                                />
                                <button type="submit" className="start-quiz-btn" disabled={loading}>
                                    {loading ? 'Loading...' : 'Start Quiz'}
                                </button>
                            </form>
                        </div>
                    </>
                )}
                {error && <p className="error-message">{error}</p>}
                {quizData && renderQuiz()}
            </div>
        </div>
    );
}

function ResultsContent({ currentUser, quizData, results, selectedAnswers }) {
    const [quizCode, setQuizCode] = useState('');
    const [quizResult, setQuizResult] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (quizData && results && selectedAnswers) {
            // If quiz data and results are directly passed, use them to set quizResult
            setQuizResult({
                quizName: quizData.quiz_name,
                score: results.score,
                totalQuestions: results.totalQuestions,
                questions: quizData.questions.questions.map((question, index) => {
                    const correctAnswerIndex = question.options.findIndex(option => option.is_correct);
                    return {
                        question_text: question.question_text,
                        options: question.options.map((option, optionIndex) => ({
                            ...option,
                            isSelected: selectedAnswers[index] == optionIndex,
                            isCorrectAnswer: optionIndex == correctAnswerIndex,
                        })),
                    };
                }),
                userAnswers: selectedAnswers,
            });
        } else if (quizCode && currentUser?.id) {
            // If no direct quiz data and results are passed, fetch using quizCode
            const fetchQuizResult = async () => {
                setLoading(true);
                setError('');
                try {
                    const response = await axios.get(`${API_BASE_URL}/quiz-result/${quizCode}/${currentUser.id}`);
                    if (response.status !== 200) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    setQuizResult(response.data);
                } catch (error) {
                    console.error('Error fetching quiz result:', error);
                    setError('An error occurred while fetching the quiz result.');
                } finally {
                    setLoading(false);
                }
            };
            fetchQuizResult();
        }
    }, [quizData, results, selectedAnswers, quizCode, currentUser?.id]);

    const handleQuizCodeSubmit = async (e) => {
        e.preventDefault();
        setQuizCode(e.target.value); // Store the entered quiz code
    };

    const renderQuizResult = () => {
        if (!quizResult) return null;

        return (
            <div className="quiz-result">
                <h3>{quizResult.quizName}</h3>
                <p className="final-score">Final Score: {quizResult.score} / {quizResult.totalQuestions}</p>
                {quizResult.questions.map((question, questionIndex) => (
                    <div key={questionIndex} className="question-card">
                        <h4>Question {questionIndex + 1}</h4>
                        <p>{question.question_text}</p>
                        <div className="options-container">
                            {question.options.map((option, optionIndex) => {
                                const isSelected = quizResult.userAnswers[questionIndex] == optionIndex;
                                const isCorrectAnswer = option.isCorrectAnswer;
                                let className = 'option-item';
                                if (isCorrectAnswer) {
                                    className += ' correct';
                                } else if (isSelected && !isCorrectAnswer) {
                                    className += ' incorrect';
                                }

                                return (
                                    <div key={optionIndex} className={className}>
                                        <label>
                                            <input
                                                type="radio"
                                                checked={isSelected}
                                                disabled
                                            />
                                            <span>{option.text}</span>
                                        </label>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="content">
            <h2>Quiz Results</h2>
            {!quizData && !results && (
                <div className="results-form-container">
                    <form onSubmit={handleQuizCodeSubmit}>
                        <input
                            type="text"
                            placeholder="Enter Quiz Code to View Results"
                            value={quizCode}
                            onChange={(e) => setQuizCode(e.target.value)}
                            className="quiz-code-input"
                        />
                        <button type="submit" className="view-results-btn" disabled={loading}>
                            {loading ? 'Loading...' : 'View Results'}
                        </button>
                    </form>
                </div>
            )}
            {error && <p className="error-message">{error}</p>}
            {renderQuizResult()}
        </div>
    );
}

function SettingsContent({ currentUser }) {
    const navigate = useNavigate();
    const [showPasswordFields, setShowPasswordFields] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        currentPassword: '',
        newPassword: '',
    });
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/');
    };

    const handlePasswordChange = async () => {
        setLoading(true);
        setMessage('');
        try {
            if (!currentUser?.username) {
                throw new Error('User not authenticated');
            }
            const response = await axios.post('http://localhost:3000/change-password', {
                ...formData,
                username: currentUser.username,
                userType: 'student',
            });

            if (response.status === 200) {
                setMessage('Password changed successfully');
                setFormData({
                    username: '',
                    currentPassword: '',
                    newPassword: '',
                });
                setShowPasswordFields(false);
            } else {
                setMessage(response.data.message || 'Failed to change password');
            }
        } catch (error) {
            console.error('Error changing password:', error);
            setMessage('An error occurred while changing the password');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevState) => ({ ...prevState, [name]: value }));
    };

    return (
        <div className="content">
            <h2>Settings</h2>
            <div className="settings-options">
                <button className="settings-button logout" onClick={handleLogout}>
                    Logout
                </button>
                <button
                    className="settings-button change-password"
                    onClick={() => setShowPasswordFields(!showPasswordFields)}
                >
                    Change Password
                </button>
                {showPasswordFields && (
                    <div className="password-change-fields">
                        <input
                            type="password"
                            name="currentPassword"
                            placeholder="Current Password"
                            value={formData.currentPassword}
                            onChange={handleInputChange}
                            disabled={loading}
                        />
                        <input
                            type="password"
                            name="newPassword"
                            placeholder="New Password"
                            value={formData.newPassword}
                            onChange={handleInputChange}
                            disabled={loading}
                        />
                        <button onClick={handlePasswordChange} disabled={loading}>
                            {loading ? 'Changing...' : 'Submit'}
                        </button>
                    </div>
                )}
                {message && <p className="message">{message}</p>}
            </div>
        </div>
    );
}

export default StudentDashboard;