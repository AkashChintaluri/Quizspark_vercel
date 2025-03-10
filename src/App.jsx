// src/App.jsx
import './App.css';
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import Home from './pages/Home';
import StudentLogin from './pages/StudentLogin';
import TeacherLogin from './pages/TeacherLogin';
import SignupForm from './pages/SignupForm';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import Header from './components/Header';

const Layout = ({ children }) => (
    <>
        <Header />
        {children}
    </>
);

function App() {
    return (
        <ChakraProvider>
            <Router>
                <div className="App">
                    <Routes>
                        <Route path="/" element={<Layout><Home /></Layout>} />
                        <Route path="/student-login" element={<Layout><StudentLogin /></Layout>} />
                        <Route path="/teacher-login" element={<Layout><TeacherLogin /></Layout>} />
                        <Route path="/signup" element={<Layout><SignupForm /></Layout>} />

                        {/* Student Dashboard Routes */}
                        <Route path="/student-dashboard" element={<StudentDashboard />}>
                            <Route index element={null} /> {/* Default route for /student-dashboard */}
                            <Route path="take-quiz/:quizCode" element={null} /> {/* Nested route for quiz */}
                            <Route path="quiz/:quizCode" element={null} /> {/* Nested route for results */}
                        </Route>

                        <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
                    </Routes>
                </div>
            </Router>
        </ChakraProvider>
    );
}

export default App;