import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './TeacherList.css';

function TeacherList({ studentId }) {
    const [teachers, setTeachers] = useState([]);
    const [subscriptions, setSubscriptions] = useState(new Set());
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [teachersRes, subsRes] = await Promise.all([
                    axios.get('/api/teachers'),
                    axios.get(`/api/subscriptions/${studentId}`)
                ]);

                if (Array.isArray(teachersRes.data)) {
                    setTeachers(teachersRes.data);
                } else {
                    console.warn('Teachers response is not an array:', teachersRes.data);
                    setTeachers([]);
                    setError('Invalid teachers data received.');
                }

                if (Array.isArray(subsRes.data)) {
                    setSubscriptions(new Set(subsRes.data.map(sub => sub.id)));
                } else {
                    console.warn('Subscriptions response is not an array:', subsRes.data);
                    setSubscriptions(new Set());
                    setError(subsRes.data?.error || 'Invalid subscriptions data received.');
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                setError(error.response?.data?.error || 'Failed to fetch teacher data.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [studentId]);

    const handleSubscription = async (teacherId, action) => {
        try {
            await axios.post(`/api/${action}`, {
                student_id: studentId,
                teacher_id: teacherId
            });
            setSubscriptions(prev => {
                const newSubs = new Set(prev);
                action === 'subscribe' ? newSubs.add(teacherId) : newSubs.delete(teacherId);
                return newSubs;
            });
        } catch (error) {
            console.error('Subscription action failed:', error);
            setError(error.response?.data?.error || `Failed to ${action}.`);
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const subscribedTeachers = teachers.filter(teacher => subscriptions.has(teacher.id));
    const unsubscribedTeachers = teachers.filter(teacher => !subscriptions.has(teacher.id));
    const filteredUnsubscribedTeachers = unsubscribedTeachers.filter(teacher =>
        teacher.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="loading">Loading teachers...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="teacher-list">
            <h3>Your Subscribed Teachers</h3>
            {subscribedTeachers.length === 0 ? (
                <p className="no-teachers">You haven’t subscribed to any teachers yet.</p>
            ) : (
                <div className="teacher-grid">
                    {subscribedTeachers.map(teacher => (
                        <div key={teacher.id} className="teacher-card">
                            <div className="teacher-info">
                                <h4>{teacher.username}</h4>
                                <p>{teacher.email}</p>
                            </div>
                            <div className="teacher-actions">
                                <span className="status subscribed">Subscribed</span>
                                <button
                                    onClick={() => handleSubscription(teacher.id, 'unsubscribe')}
                                    className="subscribed-btn"
                                >
                                    Unsubscribe
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="unsubscribed-section">
                <button
                    className="dropdown-toggle"
                    onClick={toggleDropdown}
                >
                    {isDropdownOpen ? 'Hide Available Teachers' : 'Show Available Teachers'}
                </button>
                {isDropdownOpen && (
                    <div className="dropdown-menu">
                        <input
                            type="text"
                            placeholder="Search teachers..."
                            value={searchTerm}
                            onChange={handleSearch}
                            className="search-input"
                        />
                        {filteredUnsubscribedTeachers.length === 0 ? (
                            <p className="no-teachers">No matching teachers found.</p>
                        ) : (
                            <ul className="teacher-dropdown-list">
                                {filteredUnsubscribedTeachers.map(teacher => (
                                    <li key={teacher.id} className="dropdown-item">
                                        <span>{teacher.username} ({teacher.email})</span>
                                        <button
                                            onClick={() => handleSubscription(teacher.id, 'subscribe')}
                                            className="subscribe-btn"
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