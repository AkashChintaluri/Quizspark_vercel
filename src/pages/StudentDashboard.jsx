import React, {
    useState,
    useEffect
} from 'react';
import {
    useNavigate
} from 'react-router-dom';
import './StudentDashboard.css';
import './TakeQuiz.css';

function StudentDashboard() {
    const [activeTab, setActiveTab] = useState('home');
    const [currentUser, setCurrentUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            navigate('/'); // Redirect to login if not authenticated
        } else {
            setCurrentUser(JSON.parse(storedUser));
        }
    }, [navigate]);

    return (
        <div className="student-dashboard">
            <Sidebar activeTab={activeTab}
                     setActiveTab={setActiveTab}
                     currentUser={currentUser}/>
            <Content activeTab={activeTab}
                     currentUser={currentUser}/>
        </div>
    );
}

function Sidebar({
                     activeTab,
                     setActiveTab,
                     currentUser
                 }) {
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

function Content({
                     activeTab,
                     currentUser
                 }) {
    switch (activeTab) {
        case 'Home':
            return <HomeContent currentUser={currentUser}/>;
        case 'Take Quiz':
            return <TakeQuizContent currentUser={currentUser}/>;
        case 'Results':
            return <ResultsContent currentUser={currentUser}/>;
        case 'Settings':
            return <SettingsContent currentUser={currentUser}/>;
        default:
            return <HomeContent currentUser={currentUser}/>;
    }
}

function HomeContent({
                         currentUser
                     }) {
    return (
        <div className="content">
            <h2>Home</h2>
            <p>Welcome to your dashboard, {currentUser?.username}! Here you can view your upcoming quizzes and past
                results.</p>
        </div>
    );
}

function TakeQuizContent({ currentUser }) {
    const [quizCode, setQuizCode] = useState('');
    const [quizData, setQuizData] = useState(null);
    const [error, setError] = useState('');
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [showQuizCodeInput, setShowQuizCodeInput] = useState(true);
    const [submissionResult, setSubmissionResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [hasAttempted, setHasAttempted] = useState(false);
    const navigate = useNavigate();

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
            const response = await fetch(`http://localhost:3000/api/quizzes/${quizCode}`);
            console.log("Fetching quiz with code:", quizCode); // Debugging line
            if (!response.ok) {
                console.error(`Fetch error: ${response.status} ${response.statusText}`); // More detailed error
                if (response.status === 404) {
                    setError('Quiz not found with this code.');
                } else {
                    setError(`Failed to fetch quiz. Status: ${response.status}, Text: ${response.statusText}`);
                }
                setQuizData(null);
                return;
            }
            const data = await response.json();
            console.log("Quiz data received:", data); // Debugging line
            setQuizData(data);
            setShowQuizCodeInput(false);
        } catch (err) {
            console.error('Error fetching quiz:', err);
            setError('An error occurred while fetching the quiz.');
            setQuizData(null);
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerChange = (questionIndex, optionIndex) => {
        const newSelectedAnswers = { ...selectedAnswers };

        if (!newSelectedAnswers[questionIndex]) {
            newSelectedAnswers[questionIndex] = [];
        }

        if (newSelectedAnswers[questionIndex].includes(optionIndex)) {
            newSelectedAnswers[questionIndex] = newSelectedAnswers[questionIndex].filter(
                (index) => index !== optionIndex
            );
        } else {
            newSelectedAnswers[questionIndex].push(optionIndex);
        }

        setSelectedAnswers(newSelectedAnswers);
    };

    const handleSubmitQuiz = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:3000/api/submit-quiz', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    quiz_code: quizCode,
                    user_id: currentUser.id,
                    answers: selectedAnswers,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                console.log('Quiz submitted successfully:', data);
                setSubmissionResult(data);
            } else {
                console.error('Failed to submit quiz:', data);
                setError(data.message || 'Failed to submit quiz. Please try again.');
            }
        } catch (error) {
            console.error('Error submitting quiz:', error);
            setError('An error occurred while submitting the quiz');
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
                                        <label
                                            className={
                                                selectedAnswers[index]?.includes(optionIndex)
                                                    ? 'selected'
                                                    : ''
                                            }
                                        >
                                            <input
                                                type="checkbox"
                                                name={`question_${index}`}
                                                value={optionIndex}
                                                checked={selectedAnswers[index]?.includes(optionIndex)}
                                                onChange={() => handleAnswerChange(index, optionIndex)}
                                                disabled={hasAttempted}
                                            />
                                            <span className="option-text">{option.text}</span>
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
                {!hasAttempted && (
                    <button className="submit-quiz-btn" onClick={handleSubmitQuiz} disabled={loading}>
                        {loading ? 'Submitting...' : 'Submit Quiz'}
                    </button>
                )}
            </div>
        );
    };

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
                {submissionResult ? (
                    <ResultsContent
                        quizData={quizData}
                        results={submissionResult}
                        selectedAnswers={hasAttempted ? JSON.parse(submissionResult.answers) : selectedAnswers}
                        hasAttempted={hasAttempted}
                        currentUser={currentUser}
                    />
                ) : (
                    quizData && renderQuiz()
                )}
            </div>
        </div>
    );
}

function ResultsContent({ currentUser }) {
    const [quizCode, setQuizCode] = useState('');
    const [quizResult, setQuizResult] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleQuizCodeSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch(`http://localhost:3000/api/quiz-result/${quizCode}/${currentUser.id}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setQuizResult(data);
        } catch (error) {
            console.error('Error fetching quiz result:', error);
            setError('An error occurred while fetching the quiz result.');
        } finally {
            setLoading(false);
        }
    };

    const renderQuizResult = () => {
        if (!quizResult) return null;

        return (
            <>
                <h3>{quizResult.quizName}</h3>
                {quizResult.hasAttempted ? (
                    <>
                        <p>Score: {quizResult.score} / {quizResult.totalQuestions}</p>
                        {quizResult.questions.map((question, index) => (
                            <div key={index} className="question-card">
                                <h4>Question {index + 1}</h4>
                                <p>{question.question_text}</p>
                                <div className="options-container">
                                    {question.options.map((option, optionIndex) => {
                                        const isSelected = quizResult.userAnswers[index]?.includes(optionIndex);
                                        const isCorrect = option.is_correct;
                                        let className = 'option-item';
                                        if (isSelected) className += isCorrect ? ' correct' : ' incorrect';
                                        else if (isCorrect) className += ' correct-answer';

                                        return (
                                            <div key={optionIndex} className={className}>
                                                <label>
                                                    <input type="checkbox" checked={isSelected} disabled />
                                                    <span>{option.text}</span>
                                                </label>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </>
                ) : (
                    <p>You haven't attempted this quiz yet.</p>
                )}
            </>
        );
    };

    return (
        <div className="content">
            <h2>Quiz Results</h2>
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
            {error && <p className="error-message">{error}</p>}
            {renderQuizResult()}
        </div>
    );
}

function SettingsContent({
                             currentUser
                         }) {
    const navigate = useNavigate();
    const [showPasswordFields, setShowPasswordFields] = useState(false);
    const [username, setUsername] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/');
    };

    const handlePasswordChange = async () => {
        try {
            const response = await fetch('http://localhost:5000/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username,
                    currentPassword,
                    newPassword,
                    userType: 'student' // Explicitly set for student dashboard
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage('Password changed successfully');
                setUsername('');
                setCurrentPassword('');
                setNewPassword('');
                setShowPasswordFields(false);
            } else {
                setMessage(data.message || 'Failed to change password');
            }
        } catch (error) {
            console.error('Error changing password:', error);
            setMessage('An error occurred while changing the password');
        }
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
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                        <input
                            type="password"
                            placeholder="Current Password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                        />
                        <input
                            type="password"
                            placeholder="New Password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <button onClick={handlePasswordChange}>Submit</button>
                    </div>
                )}
                {message && <p className="message">{message}</p>}
            </div>
        </div>
    );
}

export default StudentDashboard;