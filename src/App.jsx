    // src/App.jsx
    import './App.css';  // Add this at the top of your file
    import React from 'react';
    import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
    import Header from './components/Header';
    import StudentLogin from './components/StudentLogin';
    import TeacherLogin from './components/TeacherLogin';
    import StudentDashboard from './components/StudentDashboard';
    import TeacherDashboard from './components/TeacherDashboard';
    import Home from './components/Home';
    import SignupForm from './components/SignupForm';



    function App() {
        return (
            <Router>
                <div className="App">
                    <Header />
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/student-login" element={<StudentLogin />} />
                        <Route path="/teacher-login" element={<TeacherLogin />} />
                        <Route path="/signup" element={<SignupForm />} />
                        <Route path="/student-dashboard" element={<StudentDashboard />} />
                        <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
                    </Routes>
                </div>
            </Router>
        );
    }

    export default App;
