import React from 'react';
import { FaBell, FaPlus, FaEllipsisV, FaCalendarAlt } from 'react-icons/fa';
import '../styles/BulletinBoard.css';

const BulletinBoard = ({ department }) => {
  const announcements = [
    {
      department: 'FINANCE',
      title: 'Extended hours',
      description: 'Please be informed that the Finance Office will extend its operating hours from 6:00 AM to 8:00 PM to better accommodate students and parents. You may visit within this time for payments, balance inquiries, and other finance-related concerns. Thank you.',
      image: '/finance-illustration.png'
    }
  ];

  const deadlines = [
    {
      month: 'MAR',
      day: '15',
      title: 'Clearance Deadline',
      office: 'LIBRARY'
    },
    {
      month: 'MAR',
      day: '22',
      title: 'Graduation Fee Payment',
      office: 'FINANCE OFFICE'
    },
    {
      month: 'APR',
      day: '19',
      title: 'Releasing of Diplomas',
      office: 'REGISTRAR OFFICE'
    }
  ];

  return (
    <div className="bulletin-board-container">
      <div className="bulletin-header">
        <h1 className="bulletin-title">Bulletin Board</h1>
        <div className="bulletin-header-actions">
          <button className="create-announcement-btn">
            <FaPlus />
            Create new announcement
          </button>
          <FaBell className="notification-bell" />
        </div>
      </div>

      <div className="hero-banner">
        <div className="hero-overlay">
          <h2 className="hero-title">FINAL LISTING FOR 2026 GRADUATION</h2>
          <p className="hero-subtitle">
            Ensure all academic record is clear and all departments requirements are met by March 25.
          </p>
        </div>
      </div>

      <div className="bulletin-content-grid">
        <div className="announcements-section">
          <h3 className="section-title">Announcements</h3>
          
          {announcements.map((announcement, index) => (
            <div key={index} className="announcement-card">
              <div className="announcement-image">
                <div className="finance-illustration">
                  <svg viewBox="0 0 200 200" className="illustration-svg">
                    <rect x="20" y="80" width="80" height="100" fill="#8CB986" rx="5"/>
                    <rect x="30" y="90" width="60" height="70" fill="#E1E7DF" rx="3"/>
                    <circle cx="60" cy="50" r="20" fill="#FFD4A3"/>
                    <rect x="50" y="60" width="20" height="30" fill="#105E06"/>
                    <rect x="120" y="100" width="60" height="60" fill="#105E06" rx="5"/>
                    <rect x="130" y="110" width="15" height="15" fill="#E1E7DF" rx="2"/>
                    <rect x="155" y="110" width="15" height="15" fill="#E1E7DF" rx="2"/>
                    <rect x="130" y="135" width="15" height="15" fill="#E1E7DF" rx="2"/>
                    <rect x="155" y="135" width="15" height="15" fill="#E1E7DF" rx="2"/>
                  </svg>
                </div>
              </div>
              <div className="announcement-content">
                <div className="announcement-header-row">
                  <span className="announcement-department">{announcement.department}</span>
                  <FaEllipsisV className="announcement-menu-icon" />
                </div>
                <h4 className="announcement-title">{announcement.title}</h4>
                <p className="announcement-description">{announcement.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="deadlines-section">
          <div className="deadlines-header">
            <FaCalendarAlt className="calendar-icon" />
            <h3 className="deadlines-title">Important Deadlines</h3>
          </div>
          
          <div className="deadlines-list">
            {deadlines.map((deadline, index) => (
              <div key={index} className="deadline-item">
                <div className="deadline-date">
                  <span className="deadline-month">{deadline.month}</span>
                  <span className="deadline-day">{deadline.day}</span>
                </div>
                <div className="deadline-info">
                  <p className="deadline-title">{deadline.title}</p>
                  <p className="deadline-office">{deadline.office}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulletinBoard;
