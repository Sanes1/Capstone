import React, { useState } from 'react';
import { MdDashboard, MdDescription, MdViewList, MdThumbUp, MdHelp, MdExpandMore, MdExpandLess, MdExitToApp } from 'react-icons/md';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import '../styles/Sidebar.css';

function Sidebar({ activePage, onNavigate, hasUnreadBulletin = false }) {
  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      try {
        await signOut(auth);
        // Clear all student-related localStorage
        localStorage.removeItem('studentData');
        localStorage.removeItem('studentLoggedIn');
        localStorage.removeItem('studentIsGuest');
        // Reload to trigger login screen
        window.location.href = '/';
      } catch (error) {
        console.error('Logout error:', error);
        alert('Failed to logout. Please try again.');
      }
    }
  };
  const [feedbackOpen, setFeedbackOpen] = useState(
    activePage.startsWith('feedback')
  );

  return (
    <aside className="sidebar">
      <nav className="menu">
        <button 
          className={activePage === 'dashboard' ? 'active' : ''} 
          onClick={() => onNavigate('dashboard')}
        >
          <MdDashboard /> Dashboard
        </button>
        <button 
          className={activePage === 'request' ? 'active' : ''} 
          onClick={() => onNavigate('request')}
        >
          <MdDescription /> My Request
        </button>
        <button 
          className={activePage === 'bulletin' ? 'active' : ''} 
          onClick={() => onNavigate('bulletin')}
        >
          <MdViewList /> Bulletin Board
          {hasUnreadBulletin && <span className="unread-indicator"></span>}
        </button>
        
        <div className="menu-group">
          <button 
            className={activePage.startsWith('feedback') ? 'active' : ''} 
            onClick={() => {
              if (feedbackOpen && activePage === 'feedback') {
                // If already open and on feedback overview, just toggle
                setFeedbackOpen(!feedbackOpen);
              } else {
                // Open dropdown and navigate to overview
                setFeedbackOpen(true);
                onNavigate('feedback');
              }
            }}
          >
            <MdThumbUp /> Feedback
            {feedbackOpen ? <MdExpandLess className="expand-icon" /> : <MdExpandMore className="expand-icon" />}
          </button>
          {feedbackOpen && (
            <div className="submenu">
              <div 
                className={`submenu-item ${activePage === 'feedback-discipline' ? 'submenu-active' : ''}`}
                onClick={() => onNavigate('feedback-discipline')}
              >
                Discipline
              </div>
              <div 
                className={`submenu-item ${activePage === 'feedback-library' ? 'submenu-active' : ''}`}
                onClick={() => onNavigate('feedback-library')}
              >
                Library
              </div>
              <div 
                className={`submenu-item ${activePage === 'feedback-registrar' ? 'submenu-active' : ''}`}
                onClick={() => onNavigate('feedback-registrar')}
              >
                Registrar
              </div>
              <div 
                className={`submenu-item ${activePage === 'feedback-finance' ? 'submenu-active' : ''}`}
                onClick={() => onNavigate('feedback-finance')}
              >
                Finance
              </div>
            </div>
          )}
        </div>

        <button 
          className={activePage === 'faq' ? 'active' : ''} 
          onClick={() => onNavigate('faq')}
        >
          <MdHelp /> FAQ's
        </button>
      </nav>

      <div className="office-info">
        <h4>OFFICE HOURS</h4>
        <p>Mon - Fri: 7:00AM - 7:00PM</p>
        <p>Sat: 9:00AM - 3:00PM</p>
        <h4>Email:</h4>
        <p>academiasanjose@gmail.com</p>
        <h4>Location:</h4>
        <p>8WHV+322, S.B. Cabahug, Mandaue, 6014 Cebu</p>
      </div>

      <button className="logout-button" onClick={handleLogout}>
        <MdExitToApp /> Logout
      </button>
    </aside>
  );
}

export default Sidebar;
