import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './TeacherDashboard.css';
import './MakeQuizzes.css';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function TeacherDashboard() {
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
        <div className="teacher-dashboard">
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} currentUser={currentUser} />
            <Content activeTab={activeTab} currentUser={currentUser} setActiveTab={setActiveTab} />
        </div>
    );
}

function Sidebar({ activeTab, setActiveTab, currentUser }) {
    return (
        <div className="sidebar">
            <h2>Teacher Dashboard</h2>
            {currentUser && (
                <div className="welcome-box">
                    <p>Welcome, {currentUser.username}!</p>
                </div>
            )}

            <nav>
                <ul>
                    {['Home', 'Make Quizzes', 'Results', 'Settings'].map((tab) => (
                        <li key={tab}>
                            <button
                                className={activeTab === tab.toLowerCase() ? 'active' : ''}
                                onClick={() => setActiveTab(tab.toLowerCase())}
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

function Content({ activeTab, currentUser, setActiveTab }) {
    switch (activeTab) {
        case 'home':
            return <HomeContent currentUser={currentUser} setActiveTab={setActiveTab} />;
        case 'make quizzes':
            return <MakeQuizzesContent currentUser={currentUser} />;
        case 'results':
            return <ResultsContent currentUser={currentUser} />;
        case 'settings':
            return <SettingsContent currentUser={currentUser} />;
        default:
            return <HomeContent currentUser={currentUser} setActiveTab={setActiveTab} />;
    }
}

function HomeContent({ currentUser, setActiveTab }) {
    const [quizzes, setQuizzes] = useState([]);
    const [filteredQuizzes, setFilteredQuizzes] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedQuiz, setSelectedQuiz] = useState(null);
    const [editQuizData, setEditQuizData] = useState({
        quiz_name: '',
        due_date: '',
        questions: [],
    });
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCreatedQuizzes = async () => {
            if (!currentUser?.id) return;

            setLoading(true);
            setError('');
            try {
                const response = await axios.get(`http://localhost:3000/api/quizzes/created/${currentUser.id}`);
                if (response.status === 200) {
                    setQuizzes(response.data);
                    setFilteredQuizzes(response.data);
                } else {
                    throw new Error('Failed to fetch quizzes');
                }
            } catch (err) {
                console.error('Error fetching created quizzes:', err);
                setError('Failed to load your quizzes. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchCreatedQuizzes();
    }, [currentUser]);

    useEffect(() => {
        const filtered = quizzes.filter(quiz =>
            quiz.quiz_name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredQuizzes(filtered);
    }, [searchTerm, quizzes]);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleCreateQuiz = () => {
        setActiveTab('make quizzes');
    };

    const handleViewDetails = (quiz) => {
        setSelectedQuiz(quiz);
        setEditQuizData({
            quiz_name: quiz.quiz_name,
            due_date: new Date(quiz.due_date).toISOString().slice(0, 16),
            questions: quiz.questions.questions,
        });
    };

    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setEditQuizData((prev) => ({ ...prev, [name]: value }));
    };

    const handleQuestionChange = (index, field, value) => {
        const updatedQuestions = [...editQuizData.questions];
        updatedQuestions[index][field] = value;
        setEditQuizData((prev) => ({ ...prev, questions: updatedQuestions }));
    };

    const handleOptionChange = (qIndex, oIndex, value) => {
        const updatedQuestions = [...editQuizData.questions];
        updatedQuestions[qIndex].options[oIndex].text = value;
        setEditQuizData((prev) => ({ ...prev, questions: updatedQuestions }));
    };

    const handleCorrectOptionToggle = (qIndex, oIndex) => {
        const updatedQuestions = [...editQuizData.questions];
        updatedQuestions[qIndex].options = updatedQuestions[qIndex].options.map((opt, idx) => ({
            ...opt,
            is_correct: idx === oIndex ? !opt.is_correct : opt.is_correct,
        }));
        setEditQuizData((prev) => ({ ...prev, questions: updatedQuestions }));
    };

    const handleSaveChanges = async () => {
        try {
            const response = await axios.put(`http://localhost:3000/api/quizzes/${selectedQuiz.quiz_id}`, {
                quiz_name: editQuizData.quiz_name,
                due_date: editQuizData.due_date,
                questions: { questions: editQuizData.questions },
            });

            if (response.status === 200) {
                setMessage('Quiz updated successfully!');
                setQuizzes(quizzes.map((q) =>
                    q.quiz_id === selectedQuiz.quiz_id
                        ? { ...q, quiz_name: editQuizData.quiz_name, due_date: editQuizData.due_date, questions: { questions: editQuizData.questions } }
                        : q
                ));
                setFilteredQuizzes(filteredQuizzes.map((q) =>
                    q.quiz_id === selectedQuiz.quiz_id
                        ? { ...q, quiz_name: editQuizData.quiz_name, due_date: editQuizData.due_date, questions: { questions: editQuizData.questions } }
                        : q
                ));
                setTimeout(() => setMessage(''), 3000);
                setSelectedQuiz(null);
            } else {
                setMessage('Failed to update quiz.');
            }
        } catch (error) {
            console.error('Error updating quiz:', error);
            setMessage('An error occurred while updating the quiz.');
        }
    };

    const handleCancel = () => {
        setSelectedQuiz(null);
        setMessage('');
    };

    // Get stats
    const totalQuizzes = quizzes.length;
    const upcomingQuizzes = quizzes.filter(quiz => new Date(quiz.due_date) > new Date()).length;
    const recentQuiz = quizzes.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];

    return (
        <div className="content">
            <div className="dashboard-header">
                <h1 className="dashboard-title">Your Quiz Dashboard</h1>
                <button className="create-quiz-btn" onClick={handleCreateQuiz}>
                    Create New Quiz
                </button>
            </div>

            <div className="stats-section">
                <div className="stat-card">
                    <span className="stat-value">{totalQuizzes}</span>
                    <span className="stat-label">Total Quizzes</span>
                </div>
                <div className="stat-card">
                    <span className="stat-value">{upcomingQuizzes}</span>
                    <span className="stat-label">Upcoming Due</span>
                </div>
                <div className="stat-card">
                    <span className="stat-value">{quizzes.length > 0 ? 'Yes' : 'No'}</span>
                    <span className="stat-label">Recent Activity</span>
                </div>
            </div>

            {loading && (
                <div className="loading-overlay">
                    <div className="spinner"></div>
                    <p>Loading your quizzes...</p>
                </div>
            )}
            {error && (
                <div className="error-message">
                    <span className="error-icon">⚠️</span>
                    {error}
                </div>
            )}

            {!loading && !error && filteredQuizzes.length === 0 && (
                <div className="empty-state">
                    {searchTerm ? (
                        <p>No quizzes match "<strong>{searchTerm}</strong>". Try a different term!</p>
                    ) : (
                        <p>You haven't created any quizzes yet. Start by clicking "Create New Quiz" above!</p>
                    )}
                </div>
            )}

            {!loading && filteredQuizzes.length > 0 && (
                <>
                    {recentQuiz && (
                        <div className="latest-section">
                            <h2 className="section-title">Latest Quiz</h2>
                            <div className="latest-card">
                                <h3 className="latest-title">{recentQuiz.quiz_name}</h3>
                                <div className="quiz-details">
                                    <p><span className="detail-label">Code:</span> {recentQuiz.quiz_code}</p>
                                    <p><span className="detail-label">Questions:</span> {recentQuiz.questions.questions.length}</p>
                                    <p><span className="detail-label">Due:</span> {new Date(recentQuiz.due_date).toLocaleDateString()}</p>
                                    <p><span className="detail-label">Created:</span> {new Date(recentQuiz.created_at).toLocaleDateString()}</p>
                                </div>
                                <button className="view-details-btn" onClick={() => handleViewDetails(recentQuiz)}>
                                    View Details
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="search-section">
                        <div className="search-wrapper">
                            <span className="search-icon">🔍</span>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={handleSearchChange}
                                placeholder="Search your quizzes..."
                                className="search-input"
                            />
                        </div>
                    </div>

                    <div className="quizzes-grid">
                        {filteredQuizzes.map((quiz) => (
                            <div key={quiz.quiz_id} className="quiz-card">
                                <h3 className="quiz-title">{quiz.quiz_name}</h3>
                                <div className="quiz-details">
                                    <p><span className="detail-label">Code:</span> {quiz.quiz_code}</p>
                                    <p><span className="detail-label">Questions:</span> {quiz.questions.questions.length}</p>
                                    <p><span className="detail-label">Due:</span> {new Date(quiz.due_date).toLocaleDateString()}</p>
                                </div>
                                <button className="view-details-btn" onClick={() => handleViewDetails(quiz)}>
                                    View Details
                                </button>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {message && <div className="message">{message}</div>}

            <p className="welcome-text">Welcome, {currentUser?.username}! Manage your quizzes with ease.</p>

            {/* Edit Quiz Modal */}

            {selectedQuiz && (
                <div className="modal-overlay" onClick={handleCancel}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h4>Edit Quiz Details</h4>
                            <button className="close-btn" onClick={handleCancel}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Quiz Name:</label>
                                <input
                                    type="text"
                                    name="quiz_name"
                                    value={editQuizData.quiz_name}
                                    onChange={handleEditInputChange}
                                    className="quiz-name-input"
                                    placeholder="Enter quiz name"
                                />
                            </div>
                            <div className="form-group">
                                <label>Due Date:</label>
                                <input
                                    type="datetime-local"
                                    name="due_date"
                                    value={editQuizData.due_date}
                                    onChange={handleEditInputChange}
                                    className="due-date-input"
                                    min={new Date().toISOString().slice(0, 16)}
                                />
                            </div>
                            <div className="form-group">
                                <label>Questions:</label>
                                <div className="questions-container">
                                    {editQuizData.questions.map((question, qIndex) => (
                                        <div key={qIndex} className="edit-question-section">
                                            <input
                                                type="text"
                                                value={question.question_text}
                                                onChange={(e) => handleQuestionChange(qIndex, 'question_text', e.target.value)}
                                                placeholder={`Question ${qIndex + 1}`}
                                                className="question-input"
                                            />
                                            <div className="options-section">
                                                {question.options.map((option, oIndex) => (
                                                    <div key={oIndex} className="option-input">
                                                        <input
                                                            type="text"
                                                            value={option.text}
                                                            onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                                                            placeholder={`Option ${oIndex + 1}`}
                                                            className="option-text-input"
                                                        />
                                                        <label className="correct-label">
                                                            <input
                                                                type="checkbox"
                                                                checked={option.is_correct}
                                                                onChange={() => handleCorrectOptionToggle(qIndex, oIndex)}
                                                            />
                                                            Correct
                                                        </label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button onClick={handleSaveChanges} className="save-btn">Save Changes</button>
                            <button onClick={handleCancel} className="cancel-btn">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function MakeQuizzesContent({ currentUser }) {
    const [quizName, setQuizName] = useState('');
    const [quizCode, setQuizCode] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [questions, setQuestions] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState('');
    const [options, setOptions] = useState(['', '', '', '']);
    const [correctOptions, setCorrectOptions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const generateQuizCode = () => {
        return Math.random().toString(36).substring(2, 8).toUpperCase();
    };

    const handleOptionChange = (index, value) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const handleCorrectOptionToggle = (index) => {
        if (correctOptions.includes(index)) {
            setCorrectOptions(correctOptions.filter((opt) => opt !== index));
        } else {
            setCorrectOptions([...correctOptions, index]);
        }
    };

    const handleAddQuestion = () => {
        if (currentQuestion && options.every((option) => option.trim() !== '') && correctOptions.length > 0) {
            const newQuestion = {
                question_text: currentQuestion,
                options: options.map((option, index) => ({
                    text: option,
                    is_correct: correctOptions.includes(index),
                })),
            };
            setQuestions([...questions, newQuestion]);
            resetForm();
        } else {
            alert('Please fill in all fields and select at least one correct option before adding the question.');
        }
    };

    const resetForm = () => {
        setCurrentQuestion('');
        setOptions(['', '', '', '']);
        setCorrectOptions([]);
    };

    const handleSubmitQuiz = async () => {
        if (!quizName.trim()) {
            alert('Please enter a name for the quiz.');
            return;
        }
        if (!dueDate) {
            alert('Please set a due date for the quiz.');
            return;
        }
        if (questions.length === 0) {
            alert('Please add at least one question to the quiz.');
            return;
        }
        if (!currentUser) {
            alert('You must be logged in to create a quiz.');
            return;
        }

        setIsLoading(true);
        const generatedCode = generateQuizCode();
        setQuizCode(generatedCode);

        const quizData = {
            quiz_name: quizName,
            quiz_code: generatedCode,
            created_by: currentUser.id,
            questions: questions,
            due_date: dueDate,
        };

        try {
            const response = await axios.post('http://localhost:3000/api/quizzes', quizData, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.status === 201) {
                alert(`Quiz created successfully! Quiz Code: ${generatedCode}`);
                setQuizName('');
                setDueDate('');
                setQuestions([]);
                resetForm();
            } else {
                const errorData = response.data;
                alert(`Failed to create quiz: ${errorData.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error submitting quiz:', error);
            alert('An error occurred while creating the quiz.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="content make-quizzes">
            <h2>Make Quizzes</h2>

            <div className="quiz-details-section">
                <input
                    type="text"
                    value={quizName}
                    onChange={(e) => setQuizName(e.target.value)}
                    placeholder="Enter Quiz Name"
                    className="quiz-name-input"
                    disabled={isLoading}
                />
                <input
                    type="datetime-local"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="due-date-input"
                    min={new Date().toISOString().slice(0, 16)}
                    disabled={isLoading}
                />
            </div>

            <div className="question-form">
                <input
                    type="text"
                    value={currentQuestion}
                    onChange={(e) => setCurrentQuestion(e.target.value)}
                    placeholder="Enter your question"
                    className="question-input"
                    disabled={isLoading}
                />
                <div className="options-section">
                    {options.map((option, index) => (
                        <div key={index} className="option-input">
                            <input
                                type="text"
                                value={option}
                                onChange={(e) => handleOptionChange(index, e.target.value)}
                                placeholder={`Option ${index + 1}`}
                                disabled={isLoading}
                            />
                            <label>
                                <input
                                    type="checkbox"
                                    checked={correctOptions.includes(index)}
                                    onChange={() => handleCorrectOptionToggle(index)}
                                    disabled={isLoading}
                                />
                                Correct
                            </label>
                        </div>
                    ))}
                </div>
                <button onClick={handleAddQuestion} className="add-question-btn" disabled={isLoading}>
                    {isLoading ? 'Adding...' : 'Add Question'}
                </button>
            </div>

            <div className="questions-list">
                <h3>Added Questions:</h3>
                <ul>
                    {questions.map((q, index) => (
                        <li key={index}>{q.question_text}</li>
                    ))}
                </ul>
            </div>

            {questions.length > 0 && (
                <button onClick={handleSubmitQuiz} className="submit-quiz-btn" disabled={isLoading}>
                    {isLoading ? 'Submitting...' : 'Done - Submit Quiz'}
                </button>
            )}

            {quizCode && (
                <div className="quiz-code-section">
                    <p><strong>Quiz Code:</strong> {quizCode}</p>
                </div>
            )}
        </div>
    );
}

function ResultsContent({ currentUser }) {
    const [quizCode, setQuizCode] = useState('');
    const [attempts, setAttempts] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [quizName, setQuizName] = useState('');

    const handleQuizCodeSubmit = async (e) => {
        e.preventDefault();
        if (!quizCode.trim()) {
            setError('Please enter a quiz code');
            return;
        }

        setLoading(true);
        setError('');
        setAttempts([]);
        setQuizName('');

        try {
            const response = await axios.get(`http://localhost:3000/api/quiz-attempts/${quizCode}`);
            if (response.status === 200) {
                setAttempts(response.data);
                setQuizName(response.data[0]?.quiz_name || 'Quiz Results');
            } else {
                setError(response.data.message || 'Failed to fetch attempts');
            }
        } catch (err) {
            console.error('Error fetching quiz attempts:', err);
            setError(err.response?.data?.message || 'An error occurred while fetching results');
        } finally {
            setLoading(false);
        }
    };

    const chartData = {
        labels: attempts.map((attempt) => attempt.student_username),
        datasets: [
            {
                label: 'Score Percentage',
                data: attempts.map((attempt) => (attempt.score / attempt.total_questions) * 100),
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
                max: 100,
                title: {
                    display: true,
                    text: 'Score (%)',
                },
            },
            x: {
                title: {
                    display: true,
                    text: 'Students',
                },
            },
        },
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: `${quizName} - Score Distribution`,
            },
        },
    };

    return (
        <div className="content">
            <h2>Quiz Results</h2>
            <div className="results-form-container">
                <form onSubmit={handleQuizCodeSubmit}>
                    <input
                        type="text"
                        placeholder="Enter Quiz Code to View Results"
                        value={quizCode}
                        onChange={(e) => setQuizCode(e.target.value)}
                        className="quiz-code-input"
                        disabled={loading}
                    />
                    <button type="submit" className="view-results-btn" disabled={loading}>
                        {loading ? 'Loading...' : 'View Results'}
                    </button>
                </form>
            </div>

            {error && <p className="error-message">{error}</p>}

            {loading && <div className="loading-overlay"><div className="spinner"></div>Loading results...</div>}

            {attempts.length > 0 && (
                <div className="results-container">
                    <h3>{quizName}</h3>
                    <div className="stats-summary">
                        <p>Total Attempts: {attempts.length}</p>
                        <p>Average Score: {(attempts.reduce((sum, a) => sum + a.score, 0) / (attempts.length * attempts[0].total_questions) * 100).toFixed(1)}%</p>
                        <p>Highest Score: {Math.max(...attempts.map(a => a.score))} / {attempts[0].total_questions}</p>
                    </div>

                    <div className="chart-container" style={{ height: '400px', margin: '20px 0' }}>
                        <Bar data={chartData} options={chartOptions} />
                    </div>

                    <table className="results-table">
                        <thead>
                        <tr>
                            <th>Student</th>
                            <th>Score</th>
                            <th>Date</th>
                            <th>Attempt ID</th>
                        </tr>
                        </thead>
                        <tbody>
                        {attempts.map((attempt) => (
                            <tr key={attempt.attempt_id}>
                                <td>{attempt.student_username}</td>
                                <td>{attempt.score} / {attempt.total_questions}</td>
                                <td>{new Date(attempt.attempt_date).toLocaleString()}</td>
                                <td>{attempt.attempt_id}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}

            {!loading && !error && attempts.length === 0 && quizCode && (
                <p className="no-results">No attempts found for quiz code: {quizCode}</p>
            )}
        </div>
    );
}

function SettingsContent({ currentUser }) {
    const navigate = useNavigate();
    const [showPasswordFields, setShowPasswordFields] = useState(false);
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: ''
    });
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/');
    };

    const handlePasswordChange = async () => {
        setIsLoading(true);
        setMessage('');
        try {
            const response = await axios.post('http://localhost:3000/change-password', {
                ...formData,
                username: currentUser.username,
                userType: 'teacher'
            });

            if (response.status === 200) {
                setMessage('Password changed successfully');
                setFormData({
                    currentPassword: '',
                    newPassword: ''
                });
                setShowPasswordFields(false);
            } else {
                setMessage(response.data.message || 'Failed to change password');
            }
        } catch (error) {
            console.error('Error changing password:', error);
            setMessage('An error occurred while changing the password');
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
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
                            disabled={isLoading}
                        />
                        <input
                            type="password"
                            name="newPassword"
                            placeholder="New Password"
                            value={formData.newPassword}
                            onChange={handleInputChange}
                            disabled={isLoading}
                        />
                        <button onClick={handlePasswordChange} disabled={isLoading}>
                            {isLoading ? 'Changing...' : 'Submit'}
                        </button>
                    </div>
                )}
                {message && <p className="message">{message}</p>}
            </div>
        </div>
    );
}

export default TeacherDashboard;