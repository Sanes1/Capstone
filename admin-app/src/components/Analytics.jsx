import React, { useState, useEffect } from 'react';
import { FaBell, FaDownload, FaFilter, FaBalanceScale, FaClock, FaChartBar, FaUserCircle } from 'react-icons/fa';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import Notifications from './Notifications';
import '../styles/Analytics.css';

const Analytics = ({ department }) => {
  const [filterDate, setFilterDate] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Listen for unread notifications
    const staffData = JSON.parse(localStorage.getItem('staffData'));
    if (staffData?.uid) {
      const q = query(
        collection(db, 'notifications'),
        where('recipientId', '==', staffData.uid),
        where('recipientType', '==', 'staff')
      );

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const unread = querySnapshot.docs.filter(doc => !doc.data().isRead).length;
        setUnreadCount(unread);
      });

      return () => unsubscribe();
    }
  }, []);

  const staffActivity = [
    { name: 'Alex Smith', resolved: 48, percentage: 85 },
    { name: 'Anne Liam', resolved: 26, percentage: 60 },
    { name: 'Rico Micheal', resolved: 18, percentage: 45 },
    { name: 'Ryan Might', resolved: 8, percentage: 20 },
  ];

  const submissionData = [
    { month: 'JAN', value: 50 },
    { month: 'FEB', value: 150 },
    { month: 'MAR', value: 150 },
    { month: 'APR', value: 130 },
    { month: 'MAY', value: 180 },
    { month: 'JUN', value: 80 },
    { month: 'JUL', value: 140 },
    { month: 'AUG', value: 100 },
    { month: 'SEP', value: 60 },
    { month: 'OCT', value: 120 },
    { month: 'NOV', value: 90 },
    { month: 'DEC', value: 70 },
  ];

  const maxValue = Math.max(...submissionData.map(d => d.value));

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <h1 className="analytics-title">Department Analytics</h1>
        <div className="analytics-header-actions">
          <button className="export-pdf-btn">
            <FaDownload />
            Export PDF
          </button>
          <button className="filter-date-btn">
            <FaFilter />
            by Date
          </button>
          <div className="notification-bell" onClick={() => setShowNotifications(true)}>
            <FaBell className="bell-icon" />
            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
          </div>
        </div>
      </div>

      <div className="analytics-stats-grid">
        <div className="stat-card">
          <div className="stat-icon-container">
            <FaBalanceScale className="stat-icon" />
          </div>
          <div className="stat-content">
            <p className="stat-label">OVERALL</p>
            <p className="stat-sublabel">Total Tickets</p>
            <h2 className="stat-value">100</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-container">
            <FaClock className="stat-icon" />
          </div>
          <div className="stat-content">
            <p className="stat-label">ACTIVITY</p>
            <p className="stat-sublabel">Avg Resolution Time</p>
            <h2 className="stat-value">1h 20mins</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-container">
            <FaChartBar className="stat-icon" />
          </div>
          <div className="stat-content">
            <p className="stat-label">RATE</p>
            <p className="stat-sublabel">Cancelled Rate</p>
            <h2 className="stat-value">8%</h2>
          </div>
        </div>
      </div>

      <div className="analytics-charts-grid">
        <div className="chart-card submission-chart">
          <h3 className="chart-title">Submission Times</h3>
          <div className="bar-chart">
            <div className="bar-chart-y-axis">
              <span>300</span>
              <span>250</span>
              <span>200</span>
              <span>150</span>
              <span>100</span>
              <span>50</span>
              <span>10</span>
              <span>5</span>
              <span>0</span>
            </div>
            <div className="bar-chart-content">
              {submissionData.map((data, index) => (
                <div key={index} className="bar-container">
                  <div 
                    className="bar" 
                    style={{ height: `${(data.value / maxValue) * 100}%` }}
                  ></div>
                  <span className="bar-label">{data.month}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="chart-card staff-activity-card">
          <h3 className="chart-title">Staff Activity</h3>
          <div className="staff-list">
            {staffActivity.map((staff, index) => (
              <div key={index} className="staff-item">
                <div className="staff-info">
                  <FaUserCircle className="staff-avatar" />
                  <div className="staff-details">
                    <span className="staff-name">{staff.name}</span>
                    <span className="staff-resolved">{staff.resolved} Resolved</span>
                  </div>
                </div>
                <div className="staff-progress">
                  <div className="progress-bar-bg">
                    <div 
                      className="progress-bar-fill" 
                      style={{ width: `${staff.percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="frequent-request-section">
        <div className="frequent-header">
          <h3 className="chart-title">Frequent Ticket Request</h3>
          <div className="filter-icon-container">
            <span className="filter-label">Filter:</span>
            <FaFilter className="filter-icon-small" />
          </div>
        </div>
        
        <div className="pie-chart-container">
          <div className="pie-chart-wrapper">
            <svg viewBox="0 0 400 400" className="pie-chart">
              {/* Payments & Fees - 40% (blue) */}
              <path
                d="M 200 200 L 200 50 A 150 150 0 0 1 329.9 129.9 Z"
                fill="#5DADE2"
              />
              {/* Payment Concerns - 40% (green) */}
              <path
                d="M 200 200 L 329.9 129.9 A 150 150 0 0 1 329.9 270.1 Z"
                fill="#66bb6a"
              />
              {/* Scholarships - 10% (dark blue) */}
              <path
                d="M 200 200 L 329.9 270.1 A 150 150 0 0 1 246.35 343.3 Z"
                fill="#5B7CE6"
              />
              {/* Documents & Receipts - 8% (orange) */}
              <path
                d="M 200 200 L 246.35 343.3 A 150 150 0 0 1 153.65 343.3 Z"
                fill="#FFB74D"
              />
              {/* Other - 2% (red) */}
              <path
                d="M 200 200 L 153.65 343.3 A 150 150 0 0 1 70.1 270.1 L 200 200 Z"
                fill="#EF5350"
              />
              
              {/* Labels */}
              <text x="280" y="110" fill="#5DADE2" fontSize="20" fontWeight="600">40%</text>
              <text x="320" y="200" fill="#66bb6a" fontSize="20" fontWeight="600">40%</text>
              <text x="280" y="290" fill="#5B7CE6" fontSize="18" fontWeight="600">10%</text>
              <text x="210" y="340" fill="#FFB74D" fontSize="16" fontWeight="600">8%</text>
              <text x="110" y="310" fill="#EF5350" fontSize="14" fontWeight="600">2%</text>
            </svg>
          </div>

          <div className="pie-legend">
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: '#5DADE2' }}></div>
              <span className="legend-label">Payments & Fees</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: '#66bb6a' }}></div>
              <span className="legend-label">Payment Concerns</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: '#5B7CE6' }}></div>
              <span className="legend-label">Scholarships</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: '#FFB74D' }}></div>
              <span className="legend-label">Documents & Receipts</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: '#EF5350' }}></div>
              <span className="legend-label">Other</span>
            </div>
          </div>
        </div>
      </div>
      
      <Notifications isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
    </div>
  );
};

export default Analytics;
