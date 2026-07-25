import React, { useState, useEffect } from 'react';
import { FaUserCircle } from 'react-icons/fa';
import ProfileSettings from './ProfileSettings';
import '../styles/Header.css';

function Header() {
  const [studentData, setStudentData] = useState(null);
  const [showProfileSettings, setShowProfileSettings] = useState(false);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('studentData'));
    if (data) {
      setStudentData(data);
    }
  }, []);

  return (
    <>
      <header className="top-header">
        <div className="header-left">
          <img src="/logo.png" alt="Academia De San Jose" onError={(e) => e.target.style.display = 'none'} />
          <h2>Academia De San Jose</h2>
        </div>
        <div className="header-right">
          <div className="user-profile" onClick={() => setShowProfileSettings(true)} style={{ cursor: 'pointer' }}>
            <div className="user-text">
              <span className="user-name">
                {studentData?.firstName || 'Student'} {studentData?.lastName || ''}
              </span>
              <span className="student-id">
                Student ID: {studentData?.studentId || '00-0000-000000'}
              </span>
            </div>
            <div className="avatar">
              {studentData?.profilePicture ? (
                <img src={studentData.profilePicture} alt="Profile" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <FaUserCircle />
              )}
            </div>
          </div>
        </div>
      </header>

      {showProfileSettings && (
        <ProfileSettings onClose={() => setShowProfileSettings(false)} />
      )}
    </>
  );
}

export default Header;
