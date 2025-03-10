// StudentDashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom'; // Import useLocation
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
    const { quizCode } = useParams();

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

        // Set activeTab based on URL only if quizCode exists
        if (quizCode && activeTab !== 'results') {
            setActiveTab('results');
        } else if (!quizCode && activeTab === 'results') {
            setActiveTab('home'); // Default to home if no quizCode on refresh
        }
    }, [navigate, quizCode]);

    if (loading) {
        return <div className="loading-screen">Loading dashboard...</div>;
    }

    return (
        <div className="student-dashboard">
            {currentUser ? (
                <>
                    <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} currentUser={currentUser} navigate={navigate} />
                    <Content activeTab={activeTab} setActiveTab={setActiveTab} currentUser={currentUser} />
                </>
            ) : (
                <div className="auth-message">Session expired. Redirecting to login...</div>
            )}
        </div>
    );
}

function Sidebar({ activeTab, setActiveTab, currentUser, navigate }) {
    const handleTabChange = (tab, quizCode = null) => {
        const tabName = tab.toLowerCase();
        setActiveTab(tabName);
        // Reset URL to base dashboard when switching tabs (except for 'results' if manually clicked)
        if (tabName !== 'results' && tabName !== 'take quiz') {
            navigate('/student-dashboard', { replace: true });
        } else if (tabName === 'take quiz' && quizCode) {
            navigate(`/student-dashboard?quizCode=${quizCode}`, { replace: true }); // Navigate with quizCode
        } else if (tabName === 'results' && quizCode) {
            navigate(`/student-dashboard/results/${quizCode}`, { replace: true });
        }
    };

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
                                className={activeTab === tab.toLowerCase() ? 'active' : ''}
                                onClick={() => handleTabChange(tab)}
                            >
                                {tab}
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>
        </div>
    );
}

function Content({ activeTab, setActiveTab, currentUser }) {
    return (
        <>
            {activeTab === 'home' && <HomeContent currentUser={currentUser} setActiveTab={setActiveTab} />}
            {activeTab === 'take quiz' && <TakeQuizContent currentUser={currentUser} setActiveTab={setActiveTab} />}
            {activeTab === 'results' && <ResultsContent currentUser={currentUser} />}
            {activeTab === 'settings' && <SettingsContent currentUser={currentUser} />}
        </>
    );
}

function HomeContent({ currentUser, setActiveTab }) {
    const [upcomingQuizzes, setUpcomingQuizzes] = useState([]);
    const [subscriptions, setSubscriptions] = useState([]);
    const [stats, setStats] = useState({
        total_attempts: 0,
        average_score: 0,
        completed_quizzes: 0,
    });
    const [attemptedQuizzes, setAttemptedQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchHomeData = async () => {
            setLoading(true);
            setError('');
            try {
                if (!currentUser?.id) {
                    throw new Error('Invalid user session - currentUser.id is missing');
                }
                const endpoints = [
                    `${API_BASE_URL}/upcoming-quizzes/${currentUser.id}`,
                    `${API_BASE_URL}/user-stats/${currentUser.id}`,
                    `${API_BASE_URL}/subscriptions/${currentUser.id}`,
                    `${API_BASE_URL}/attempted-quizzes/${currentUser.id}`
                ];

                const responses = await Promise.all(
                    endpoints.map(async (url) => {
                        try {
                            const response = await axios.get(url, { timeout: 5000 });
                            return response;
                        } catch (err) {
                            console.error(`Error fetching ${url}:`, err.message);
                            return { data: [] };
                        }
                    })
                );

                const [quizzesData, statsData, subscriptionsData, attemptedQuizzesData] = responses.map(r => r.data);
                setUpcomingQuizzes(quizzesData);
                setStats(statsData || { total_attempts: 0, average_score: 0, completed_quizzes: 0 });
                setSubscriptions(subscriptionsData);
                setAttemptedQuizzes(attemptedQuizzesData);
            } catch (err) {
                console.error('Fetch error:', err.message);
                setError(err.message || 'Failed to load dashboard data.');
            } finally {
                setLoading(false);
            }
        };

        fetchHomeData();
    }, [currentUser?.id]);

    const handleQuizClick = (quizCode) => {
        setActiveTab('take quiz');
        navigate(`/student-dashboard?quizCode=${quizCode}`); // Navigate to Take Quiz with quizCode
    };

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
                                <p>{stats.total_attempts}</p>
                            </div>
                            <div className="stat-card">
                                <h4>Average Score</h4>
                                <p>{(stats.average_score || 0).toFixed(1)}%</p>
                            </div>
                            <div className="stat-card">
                                <h4>Completed Quizzes</h4>
                                <p>{stats.completed_quizzes}</p>
                            </div>
                        </div>
                    </div>
                    <div className="upcoming-quizzes">
                        <h3>Upcoming Quizzes</h3>
                        {upcomingQuizzes.length === 0 ? (
                            <p>No upcoming quizzes from your subscribed teachers.</p>
                        ) : (
                            <div className="quiz-list">
                                {upcomingQuizzes.map((quiz) => (
                                    <div key={quiz.quiz_id} className="quiz-card clickable" onClick={() => handleQuizClick(quiz.quiz_code)}>
                                        <h4>{quiz.quiz_name}</h4>
                                        <p>Code: {quiz.quiz_code}</p>
                                        <p>Teacher: {quiz.teacher_name}</p>
                                        <p>Due Date: {new Date(quiz.due_date).toLocaleDateString()}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="attempted-quizzes">
                        <h3>Attempted Quizzes</h3>
                        {attemptedQuizzes.length === 0 ? (
                            <p>You have not attempted any quizzes yet.</p>
                        ) : (
                            <div className="quiz-list">
                                {attemptedQuizzes.map((quiz) => (
                                    <div
                                        key={quiz.quiz_id}
                                        className="quiz-card clickable"
                                        onClick={() => handleQuizClick(quiz.quiz_code)}
                                    >
                                        <h4>{quiz.quiz_name}</h4>
                                        <p>Code: {quiz.quiz_code}</p>
                                        <p>Teacher: {quiz.teacher_name}</p>
                                        <p>Due Date: {new Date(quiz.due_date).toLocaleDateString()}</p>
                                    </div>
                                ))}
                            </div>
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
    const location = useLocation(); // Use useLocation to access URL parameters
    const navigate = useNavigate();

    // Extract quizCode from URL on component mount
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const urlQuizCode = params.get('quizCode');
        if (urlQuizCode) {
            setQuizCode(urlQuizCode);
            setShowQuizCodeInput(false);
            // Optionally, trigger the quiz loading immediately
            loadQuiz(urlQuizCode);
        }
    }, [location.search]);

    const loadQuiz = async (code) => {
        setError('');
        setSubmissionResult(null);
        setLoading(true);

        try {
            if (!currentUser?.id) {
                throw new Error('User not authenticated');
            }

            const attemptCheckResponse = await axios.get(`${API_BASE_URL}/check-quiz-attempt/${code}/${currentUser.id}`);
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

            const response = await axios.get(`${API_BASE_URL}/quizzes/${code}`);
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
            setShowQuizCodeInput(true);
        } finally {
            setLoading(false);
        }
    };

    const handleQuizCodeSubmit = async (e) => {
        e.preventDefault();
        if (!quizCode.trim()) {
            setError('Please enter a quiz code.');
            return;
        }
        loadQuiz(quizCode);
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
                throw new Error(response.data.message || 'Failed to submit quiz.');
            }

            setSubmissionResult(response.data);
            setActiveTab('results');
            navigate(`/student-dashboard/results/${quizCode}`);
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

function ResultsContent({ currentUser }) {
    const [quizCode, setQuizCode] = useState('');
    const [quizResult, setQuizResult] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { quizCode: urlQuizCode } = useParams();

    // Reset quizResult when leaving the Results tab
    useEffect(() => {
        if (!urlQuizCode) {
            setQuizResult(null); // Reset results when no quizCode in URL
            setQuizCode(''); // Reset quiz code input
        }
    }, [urlQuizCode]);

    useEffect(() => {
        const fetchQuizResult = async (code) => {
            setLoading(true);
            setError('');
            try {
                const response = await axios.get(`${API_BASE_URL}/quiz-result/${code}/${currentUser.id}`);
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

        if (urlQuizCode) {
            setQuizCode(urlQuizCode);
            fetchQuizResult(urlQuizCode);
        }
    }, [urlQuizCode, currentUser?.id]);

    const handleQuizCodeSubmit = async (e) => {
        e.preventDefault();
        if (quizCode) {
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
            {!urlQuizCode && (
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
            {loading ? <p>Loading results...</p> : renderQuizResult()}
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
