import React, {
    useState,
    useEffect
} from 'react';
import {
    useNavigate
} from 'react-router-dom';
import axios from 'axios'; // Import axios
import './TeacherDashboard.css';
import './MakeQuizzes.css';

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
            <h2>Teacher Dashboard</h2>
            {currentUser && (
                <div className="welcome-box"> {/* Added wrapper div */}
                    <p>Welcome, {currentUser.username}!</p>
                </div>
            )}

            <nav>
                <ul>
                    {['Home', 'Make Quizzes', 'Results', 'Settings'].map((tab) => (
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
        case 'Make Quizzes':
            return <MakeQuizzesContent currentUser={currentUser}/>;
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
            <p>Welcome to your dashboard, {currentUser
                ?.username}! Here you can manage quizzes and view student
                progress.</p>
        </div>
    );
}

function MakeQuizzesContent({
                                currentUser
                            }) {
    const [quizName, setQuizName] = useState('');
    const [quizCode, setQuizCode] = useState('');
    const [dueDate, setDueDate] = useState(''); // New state for due date
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

        setIsLoading(true); // Start loading
        const generatedCode = generateQuizCode();
        setQuizCode(generatedCode);

        const quizData = {
            quiz_name: quizName,
            quiz_code: generatedCode,
            created_by: currentUser.id, // Changed to use ID instead of username
            questions: questions,
            due_date: dueDate // Add due_date to the payload
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
                setDueDate(''); // Reset due date
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
            setIsLoading(false); // End loading
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
                    disabled={isLoading} // Disable input when loading
                />
                <input
                    type="datetime-local"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="due-date-input"
                    min={new Date().toISOString().slice(0, 16)} // Prevents past dates
                    disabled={isLoading} // Disable input when loading
                />
            </div>

            <div className="question-form">
                <input
                    type="text"
                    value={currentQuestion}
                    onChange={(e) => setCurrentQuestion(e.target.value)}
                    placeholder="Enter your question"
                    className="question-input"
                    disabled={isLoading} // Disable input when loading
                />
                <div className="options-section">
                    {options.map((option, index) => (
                        <div key={index} className="option-input">
                            <input
                                type="text"
                                value={option}
                                onChange={(e) => handleOptionChange(index, e.target.value)}
                                placeholder={`Option ${index + 1}`}
                                disabled={isLoading} // Disable input when loading
                            />
                            <label>
                                <input
                                    type="checkbox"
                                    checked={correctOptions.includes(index)}
                                    onChange={() => handleCorrectOptionToggle(index)}
                                    disabled={isLoading} // Disable input when loading
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

function ResultsContent({
                            currentUser
                        }) {
    const [results, setResults] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchResults = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await axios.get(`http://localhost:3000/api/teacher-results/${currentUser.id}`);
                if (response.status !== 200) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                setResults(response.data);
            } catch (e) {
                console.error("Could not fetch results:", e);
                setError("Failed to load results.");
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [currentUser.id]);

    return (
        <div className="content">
            <h2>Results</h2>

            {loading && <p>Loading results...</p>}
            {error && <p className="error-message">{error}</p>}

            {results.length > 0 ? (
                <table className="results-table">
                    <thead>
                    <tr>
                        <th>Student</th>
                        <th>Quiz</th>
                        <th>Score</th>
                        <th>Date</th>
                    </tr>
                    </thead>
                    <tbody>
                    {results.map(result => (
                        <tr key={result.attempt_id}>
                            <td>{result.student_username}</td>
                            <td>{result.quiz_name}</td>
                            <td>{result.score} / {result.total_questions}</td>
                            <td>{new Date(result.attempt_date).toLocaleDateString()}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            ) : (!loading && !error) ? (
                <p>No results found.</p>
            ) : null}
        </div>
    );
}

function SettingsContent({
                             currentUser
                         }) {
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
        const {
            name,
            value
        } = e.target;
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
