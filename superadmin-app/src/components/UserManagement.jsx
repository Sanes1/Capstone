import React from 'react';
import { 
  FaBell, 
  FaUser, 
  FaEnvelope, 
  FaPhone, 
  FaCalendarAlt, 
  FaShieldAlt, 
  FaPen, 
  FaLock, 
  FaKey,
  FaBan,
  FaSignInAlt,
  FaRedo
} from 'react-icons/fa';
import '../styles/UserManagement.css';

const UserManagement = () => {
  const activityHistory = [
    { text: 'System login success', time: 'Today 09:10 am' },
    { text: 'System login success', time: 'Today 09:10 am' },
    { text: 'System login success', time: 'Today 09:10 am' },
    { text: 'System login success', time: 'Today 09:10 am' }
  ];

  return (
    <div className="user-management-container">
      <div className="user-management-header">
        <h1 className="user-management-title">User Management</h1>
        <div className="form-notification">
          <FaBell className="notification-icon" />
        </div>
      </div>

      <div className="user-management-content">
        <div className="user-profile-card">
          <div className="user-avatar">
            <FaUser className="avatar-icon" />
          </div>
          
          <h2 className="user-name">Alex Smith</h2>
          <p className="user-role">Staff - Finance</p>
          
          <div className="user-details">
            <div className="detail-row">
              <FaEnvelope className="detail-icon" />
              <div className="detail-info">
                <p className="detail-label">Email Address</p>
                <p className="detail-value">alex.smith@gmail.com</p>
              </div>
            </div>
            
            <div className="detail-row">
              <FaPhone className="detail-icon" />
              <div className="detail-info">
                <p className="detail-label">Phone Number</p>
                <p className="detail-value">09912345678</p>
              </div>
            </div>
            
            <div className="detail-row">
              <FaCalendarAlt className="detail-icon" />
              <div className="detail-info">
                <p className="detail-label">Member Since</p>
                <p className="detail-value">Aug 11, 2020</p>
              </div>
            </div>
          </div>
          
          <div className="admin-actions">
            <div className="admin-actions-header">
              <FaShieldAlt className="shield-icon" />
              <h3 className="admin-actions-title">Administrative Action</h3>
            </div>
            
            <button className="action-button">
              <FaPen className="action-icon" />
              Edit Profile
            </button>
            
            <button className="action-button">
              <FaLock className="action-icon" />
              Change Permission
            </button>
            
            <button className="action-button">
              <FaKey className="action-icon" />
              Reset Password
            </button>
            
            <button className="action-button suspend">
              <FaBan className="action-icon" />
              Suspend Account
            </button>
          </div>
        </div>
        
        <div className="user-activity-section">
          <div className="activity-stats">
            <div className="stat-box">
              <p className="stat-header-text">Total Tickets Handled</p>
              <p className="stat-period">Monthly</p>
              <h3 className="stat-number">20</h3>
            </div>
            
            <div className="stat-box">
              <p className="stat-header-text">Avg. Response Time</p>
              <p className="stat-period">Monthly</p>
              <h3 className="stat-number">2.5hrs</h3>
            </div>
          </div>
          
          <div className="activity-history-card">
            <div className="activity-history-header">
              <h3 className="activity-history-title">System Activity History</h3>
            </div>
            
            <div className="activity-list">
              {activityHistory.map((activity, index) => (
                <div key={index} className="activity-item">
                  <div className="activity-icon-container">
                    <FaSignInAlt className="activity-icon" />
                  </div>
                  <div className="activity-info">
                    <p className="activity-text">{activity.text}</p>
                    <p className="activity-time">{activity.time}</p>
                  </div>
                </div>
              ))}
              
              <button className="load-more">
                <FaRedo className="load-more-icon" />
                Load full Audit Log
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
