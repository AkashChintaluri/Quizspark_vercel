import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './TeacherDashboard.css';
import './MakeQuizzes.css';

function TeacherDashboard() {
    const [activeTab, setActiveTab] = useState('home');

    return (
        <div className="teacher-dashboard">
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
            <Content activeTab={activeTab} />
        </div>
    );
}

function Sidebar({ activeTab, setActiveTab }) {
    return (
        <div className="sidebar">
            <h2>Teacher Dashboard</h2>
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

function Content({ activeTab }) {
    switch (activeTab) {
        case 'Home':
            return <HomeContent />;
        case 'Make Quizzes':
            return <MakeQuizzesContent />;
        case 'Results':
            return <ResultsContent />;
        case 'Settings':
            return <SettingsContent />;
        default:
            return <HomeContent />;
    }
}

function HomeContent() {
    return (
        <div className="content">
            <h2>Home</h2>
            <p>Welcome to your dashboard! Here you can manage quizzes and view student progress.</p>
        </div>
    );
}

function MakeQuizzesContent() {
    const [quizName, setQuizName] = useState('');
    const [quizCode, setQuizCode] = useState('');
    const [questions, setQuestions] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState('');
    const [options, setOptions] = useState(['', '', '', '']);
    const [correctOption, setCorrectOption] = useState(null);

    // Function to generate a random alphanumeric code
    const generateQuizCode = () => {
        return Math.random().toString(36).substring(2, 8).toUpperCase(); // Generates a 6-character code
    };

    const handleOptionChange = (index, value) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const handleCorrectOptionToggle = (index) => {
        setCorrectOption(index);
    };

    const handleAddQuestion = () => {
        if (currentQuestion && options.every(option => option.trim() !== '') && correctOption !== null) {
            const newQuestion = {
                question: currentQuestion,
                options: options,
                correctOption: correctOption
            };
            setQuestions([...questions, newQuestion]);
            resetForm();
        } else {
            alert('Please fill in all fields and select a correct option before adding the question.');
        }
    };

    const resetForm = () => {
        setCurrentQuestion('');
        setOptions(['', '', '', '']);
        setCorrectOption(null);
    };

    const handleSubmitQuiz = async () => {
        if (!quizName.trim()) {
            alert('Please enter a name for the quiz.');
            return;
        }

        if (questions.length === 0) {
            alert('Please add at least one question to the quiz.');
            return;
        }

        // Generate a unique quiz code
        const generatedCode = generateQuizCode();
        setQuizCode(generatedCode);

        // Prepare the quiz data
        const quizData = {
            name: quizName,
            code: generatedCode,
            questions: questions,
        };

        try {
            // Send the quiz data to the backend
            const response = await fetch('http://localhost:5000/api/quizzes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(quizData),
            });

            if (response.ok) {
                alert(`Quiz created successfully! Quiz Code: ${generatedCode}`);
                // Reset the form and questions after submission
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

            <div className="quiz-name-section">
                <input
                    type="text"
                    value={quizName}
                    onChange={(e) => setQuizName(e.target.value)}
                    placeholder="Enter Quiz Name"
                    className="quiz-name-input"
                />
            </div>

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
                                    type="radio"
                                    checked={correctOption === index}
                                    onChange={() => handleCorrectOptionToggle(index)}
                                />
                                Correct
                            </label>
                        </div>
                    ))}
                </div>
                <button onClick={handleAddQuestion} className="add-question-btn">Add Question</button>
            </div>

            <div className="questions-list">
                <h3>Added Questions:</h3>
                <ul>
                    {questions.map((q, index) => (
                        <li key={index}>{q.question}</li>
                    ))}
                </ul>
            </div>

            {questions.length > 0 && (
                <button onClick={handleSubmitQuiz} className="submit-quiz-btn">Done - Submit Quiz</button>
            )}

            {quizCode && (
                <div className="quiz-code-section">
                    <p><strong>Quiz Code:</strong> {quizCode}</p>
                </div>
            )}
        </div>
    );
}



function ResultsContent() {
    return (
        <div className="content">
            <h2>Results</h2>
            <p>View and manage your students' information and progress.</p>
        </div>
    );
}


function SettingsContent() {
    const navigate = useNavigate();
    const [showPasswordFields, setShowPasswordFields] = useState(false);
    const [username, setUsername] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleLogout = () => {
        localStorage.removeItem('authToken');
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
