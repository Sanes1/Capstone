import React from 'react';
import { FaInbox, FaClock, FaBan, FaUsers, FaCalendarAlt, FaBell } from 'react-icons/fa';
import '../styles/SuperAdminDashboard.css';

const SuperAdminDashboard = () => {
  const departmentData = [
    { label: 'FIN', value: 250, max: 400 },
    { label: 'REG', value: 175, max: 400 },
    { label: 'LIB', value: 75, max: 400 },
    { label: 'GUI', value: 125, max: 400 }
  ];

  return (
    <div className="superadmin-dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Dashboard</h1>
        <div className="dashboard-notification">
          <FaBell className="notification-icon" />
        </div>
      </div>

      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon-container">
              <FaInbox className="stat-icon" />
            </div>
            <span className="stat-label">TOTAL</span>
          </div>
          <div className="stat-value">500</div>
          <div className="stat-subtext">All Request</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon-container">
              <FaClock className="stat-icon" />
            </div>
            <span className="stat-label">ACTIVITY</span>
          </div>
          <div className="stat-value">2days 2hrs</div>
          <div className="stat-subtext">Avg. Resolution</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon-container">
              <FaBan className="stat-icon" />
            </div>
            <span className="stat-label">RATE</span>
          </div>
          <div className="stat-value">5%</div>
          <div className="stat-subtext">Cancelled Rate</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon-container">
              <FaUsers className="stat-icon" />
            </div>
            <span className="stat-label">TOTAL</span>
          </div>
          <div className="stat-value">5,900</div>
          <div className="stat-subtext">Active Users</div>
        </div>
      </div>

      <div className="chart-section">
        <div className="chart-header">
          <h2 className="chart-title">Request Receive Per Department</h2>
          <button className="filter-button">
            <span>FILTER BY</span>
            <FaCalendarAlt className="filter-icon" />
          </button>
        </div>
        
        <div className="chart-content">
          {departmentData.map((dept, index) => (
            <div key={index} className="department-bar">
              <div className="department-label">{dept.label}</div>
              <div className="bar-container">
                <div 
                  className="bar-fill" 
                  style={{ width: `${(dept.value / dept.max) * 100}%` }}
                />
              </div>
            </div>
          ))}
          
          <div className="x-axis">
            <span className="x-axis-label">0</span>
            <span className="x-axis-label">50</span>
            <span className="x-axis-label">100</span>
            <span className="x-axis-label">150</span>
            <span className="x-axis-label">200</span>
            <span className="x-axis-label">250</span>
            <span className="x-axis-label">300</span>
            <span className="x-axis-label">350</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
