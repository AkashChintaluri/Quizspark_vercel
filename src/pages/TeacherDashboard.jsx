import React, {
    useState,
    useEffect
} from 'react';
import {
    useNavigate
} from 'react-router-dom';
import './TeacherDashboard.css';
import './MakeQuizzes.css';

function TeacherDashboard() {
    const [activeTab, setActiveTab] = useState('home');
    const [currentUser, setCurrentUser] = useState(null);
    const navigate = useNavigate();

    // Fetch the current logged-in user
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
            <p>Welcome to your dashboard, {currentUser?.username}! Here you can manage quizzes and view student
                progress.</p>
        </div>
    );
}

function MakeQuizzesContent({
                                currentUser
                            }) {
    const [quizName, setQuizName] = useState('');
    const [quizCode, setQuizCode] = useState('');
    const [questions, setQuestions] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState('');
    const [options, setOptions] = useState(['', '', '', '']);
    const [correctOptions, setCorrectOptions] = useState([]); // Allow multiple correct options
    const navigate = useNavigate();

    // Function to generate a random alphanumeric code for the quiz
    const generateQuizCode = () => {
        return Math.random().toString(36).substring(2, 8).toUpperCase(); // Generates a 6-character code
    };

    // Handle changes in option input fields
    const handleOptionChange = (index, value) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    // Handle toggling of multiple correct options
    const handleCorrectOptionToggle = (index) => {
        if (correctOptions.includes(index)) {
            // Remove the option if it's already in the list
            setCorrectOptions(correctOptions.filter((opt) => opt !== index));
        } else {
            // Add the option to the list
            setCorrectOptions([...correctOptions, index]);
        }
    };

    // Add a new question to the list of questions
    const handleAddQuestion = () => {
        if (currentQuestion && options.every((option) => option.trim() !== '') && correctOptions.length > 0) {
            const newQuestion = {
                question_text: currentQuestion,
                options: options.map((option, index) => ({
                    text: option,
                    is_correct: correctOptions.includes(index), // Check if this option is in the correct options list
                })),
            };
            setQuestions([...questions, newQuestion]);
            resetForm();
        } else {
            alert('Please fill in all fields and select at least one correct option before adding the question.');
        }
    };

    // Reset the form for adding a new question
    const resetForm = () => {
        setCurrentQuestion('');
        setOptions(['', '', '', '']);
        setCorrectOptions([]);
    };

    // Submit the quiz to the backend
    const handleSubmitQuiz = async () => {
        if (!quizName.trim()) {
            alert('Please enter a name for the quiz.');
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

        const generatedCode = generateQuizCode();
        setQuizCode(generatedCode);

        const quizData = {
            quiz_name: quizName,
            quiz_code: generatedCode,
            created_by: currentUser.username,
            questions: questions // JSON structure for questions
        };

        try {
            const response = await fetch('http://localhost:3000/api/quizzes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(quizData),
            });

            if (response.ok) {
                alert(`Quiz created successfully! Quiz Code: ${generatedCode}`);
                setQuizName('');
                setQuestions([]);
                resetForm();
            } else {
                alert('Failed to create quiz. Please try again.');
            }
        } catch (error) {
            console.error('Error submitting quiz:', error);
            alert('An error occurred while creating the quiz.');
        }
    };

    return (
        <div className="content make-quizzes">
            <h2>Make Quizzes</h2>

            {/* Input field for Quiz Name */}
            <div className="quiz-name-section">
                <input
                    type="text"
                    value={quizName}
                    onChange={(e) => setQuizName(e.target.value)}
                    placeholder="Enter Quiz Name"
                    className="quiz-name-input"
                />
            </div>

            {/* Form for adding a question */}
            <div className="question-form">
                <input
                    type="text"
                    value={currentQuestion}
                    onChange={(e) => setCurrentQuestion(e.target.value)}
                    placeholder="Enter your question"
                    className="question-input"
                />
                <div className="options-section">
                    {options.map((option, index) => (
                        <div key={index} className="option-input">
                            <input
                                type="text"
                                value={option}
                                onChange={(e) => handleOptionChange(index, e.target.value)}
                                placeholder={`Option ${index + 1}`}
                            />
                            <label>
                                <input
                                    type="checkbox" // Allow multiple correct answers with checkboxes
                                    checked={correctOptions.includes(index)}
                                    onChange={() => handleCorrectOptionToggle(index)}
                                />
                                Correct
                            </label>
                        </div>
                    ))}
                </div>
                <button onClick={handleAddQuestion} className="add-question-btn">Add Question</button>
            </div>

            {/* List of added questions */}
            <div className="questions-list">
                <h3>Added Questions:</h3>
                <ul>
                    {questions.map((q, index) => (
                        <li key={index}>{q.question_text}</li>
                    ))}
                </ul>
            </div>

            {/* Submit button */}
            {questions.length > 0 && (
                <button onClick={handleSubmitQuiz} className="submit-quiz-btn">Done - Submit Quiz</button>
            )}

            {/* Display Quiz Code after submission */}
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
    return (
        <div className="content">
            <h2>Results</h2>
            <p>View and manage your students' information and progress.</p>
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
                    userType: 'teacher' // Explicitly set for teacher dashboard
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


export default TeacherDashboard;
