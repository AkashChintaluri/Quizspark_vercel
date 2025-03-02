import React, { useState } from "react";
import "./TeacherDashboard.css"; // Import CSS

const LinkItems = ["Dashboard", "Create Quiz", "View Results"];

export default function TeacherDashboard() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="dashboard-container">
            {/* Sidebar */}
            <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

            {/* Right-side Content */}
            <div className="content">
                <button className="menu-button" onClick={() => setIsOpen(true)}>☰ Menu</button>
                <div className="content-box">
                    <h2>Welcome, Teacher!</h2>
                    <p>Select an option from the sidebar to get started.</p>
                </div>
            </div>
        </div>
    );
}

const Sidebar = ({ isOpen, setIsOpen }) => {
    return (
        <div className={`sidebar ${isOpen ? "open" : ""}`}>
            <div className="sidebar-header">
                <button className="close-btn" onClick={() => setIsOpen(false)}>✖</button>
            </div>
            <nav>
                {LinkItems.map((link) => (
                    <a key={link} href="#" className="nav-item">{link}</a>
                ))}
            </nav>
        </div>
    );
};
