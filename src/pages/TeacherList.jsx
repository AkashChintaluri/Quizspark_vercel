import React, { useState, useEffect } from 'react';
import api from '../config';
import './TeacherList.css';

function TeacherList({ studentId }) {
    const [teachers, setTeachers] = useState([]);
    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [teachersResponse, subscriptionsResponse] = await Promise.all([
                    api.get('/api/teachers'),
                    api.get(`/api/subscriptions/${studentId}`)
                ]);

                setTeachers(teachersResponse.data);
                setSubscriptions(subscriptionsResponse.data);
            } catch (error) {
                setError('Failed to load teachers and subscriptions');
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        if (studentId) {
            fetchData();
        }
    }, [studentId]);

    const handleSubscribe = async (teacherId) => {
        try {
            const response = await api.post('/api/subscribe', {
                student_id: studentId,
                teacher_id: teacherId
            });

            if (response.status === 201) {
                setSubscriptions([...subscriptions, { teacher_id: teacherId }]);
                setMessage('Successfully subscribed to teacher');
            }
        } catch (error) {
            setError('Failed to subscribe to teacher');
            console.error('Subscription error:', error);
        }
    };

    const handleUnsubscribe = async (teacherId) => {
        try {
            const response = await api.post('/api/unsubscribe', {
                student_id: studentId,
                teacher_id: teacherId
            });

            if (response.status === 200) {
                setSubscriptions(subscriptions.filter(sub => sub.teacher_id !== teacherId));
                setMessage('Successfully unsubscribed from teacher');
            }
        } catch (error) {
            setError('Failed to unsubscribe from teacher');
            console.error('Unsubscription error:', error);
        }
    };

    const subscribedTeachers = teachers.filter(teacher => subscriptions.some(sub => sub.teacher_id === teacher.id));
    const unsubscribedTeachers = teachers.filter(teacher => !subscriptions.some(sub => sub.teacher_id === teacher.id));
    const filteredUnsubscribedTeachers = unsubscribedTeachers.filter(teacher =>
        teacher.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div>Loading teachers...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="teacher-list">
            <h3>Available Teachers</h3>
            {message && <div className="success-message">{message}</div>}
            <div className="teachers-grid">
                {teachers.map(teacher => (
                    <div key={teacher.id} className="teacher-card">
                        <h4>{teacher.name}</h4>
                        <p>{teacher.email}</p>
                        {subscriptions.some(sub => sub.teacher_id === teacher.id) ? (
                            <button
                                className="unsubscribe-btn"
                                onClick={() => handleUnsubscribe(teacher.id)}
                            >
                                Unsubscribe
                            </button>
                        ) : (
                            <button
                                className="subscribe-btn"
                                onClick={() => handleSubscribe(teacher.id)}
                            >
                                Subscribe
                            </button>
                        )}
                    </div>
                ))}
            </div>

            <div className="unsubscribed-section">
                <button
                    className="dropdown-toggle"
                    onClick={() => setShowDropdown(!showDropdown)}
                >
                    {showDropdown ? 'Hide Available Teachers' : 'Show Available Teachers'}
                </button>

                {showDropdown && (
                    <div className="dropdown-menu">
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search teachers..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {filteredUnsubscribedTeachers.length === 0 ? (
                            <div className="no-teachers">No teachers found</div>
                        ) : (
                            <ul className="teacher-dropdown-list">
                                {filteredUnsubscribedTeachers.map((teacher) => (
                                    <li key={teacher.id} className="dropdown-item">
                                        <span>{teacher.name}</span>
                                        <button
                                            className="subscribe-btn"
                                            onClick={() => handleSubscribe(teacher.id)}
                                        >
                                            Subscribe
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default TeacherList;