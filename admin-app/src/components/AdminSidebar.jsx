import React from 'react';
import { FaThLarge, FaTicketAlt, FaChartLine, FaClipboard, FaComment, FaUserCircle, FaSignOutAlt } from 'react-icons/fa';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import '../styles/AdminSidebar.css';

const AdminSidebar = ({ activePage, onNavigate, department }) => {
  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      try {
        await signOut(auth);
        localStorage.removeItem('staffData');
        window.location.reload();
      } catch (error) {
        console.error('Logout error:', error);
        alert('Failed to logout. Please try again.');
      }
    }
  };
  return (
    <aside className="admin-sidebar">
      <div className="sidebar-logo">
        <img src="/school-logo.png" alt="School Logo" onError={(e) => { e.target.style.display = 'none'; }} />
      </div>
      
      <nav className="sidebar-menu">
        <div
          className={`sidebar-item ${activePage === 'dashboard' ? 'active' : ''}`}
          onClick={() => onNavigate('dashboard')}
        >
          <FaThLarge className="sidebar-icon" />
          <span className="sidebar-label">Dashboard</span>
        </div>
        
        <div
          className={`sidebar-item ${activePage === 'my-tickets' ? 'active' : ''}`}
          onClick={() => onNavigate('my-tickets')}
        >
          <FaTicketAlt className="sidebar-icon" />
          <span className="sidebar-label">My Tickets</span>
        </div>
        
        <div
          className={`sidebar-item ${activePage === 'analytics' ? 'active' : ''}`}
          onClick={() => onNavigate('analytics')}
        >
          <FaChartLine className="sidebar-icon" />
          <span className="sidebar-label">Analytics</span>
        </div>
        
        <div
          className={`sidebar-item ${activePage === 'bulletin' ? 'active' : ''}`}
          onClick={() => onNavigate('bulletin')}
        >
          <FaClipboard className="sidebar-icon" />
          <span className="sidebar-label">Bulletin Board</span>
        </div>
        
        <div
          className={`sidebar-item ${activePage === 'feedback' ? 'active' : ''}`}
          onClick={() => onNavigate('feedback')}
        >
          <FaComment className="sidebar-icon" />
          <span className="sidebar-label">Feedback</span>
        </div>
      </nav>
      
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <FaUserCircle className="user-icon" />
          <div className="user-info">
            <p className="user-name">Alex Smith</p>
            <p className="user-department">{department} DEPARTMENT</p>
          </div>
        </div>
        
        <button className="logout-button" onClick={handleLogout}>
          <FaSignOutAlt className="logout-icon" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
