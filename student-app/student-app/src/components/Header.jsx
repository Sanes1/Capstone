import React, { useState, useEffect } from 'react';
import { FaUserCircle, FaBell } from 'react-icons/fa';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import ProfileSettings from './ProfileSettings';
import Notifications from './Notifications';
import '../styles/Header.css';

function Header() {
  const [studentData, setStudentData] = useState(null);
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('studentData'));
    if (data) {
      setStudentData(data);
      
      // Listen for unread notifications in real-time
      // Simplified query to avoid index requirement
      if (data.uid) {
        const q = query(
          collection(db, 'notifications'),
          where('recipientId', '==', data.uid),
          where('recipientType', '==', 'student')
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const unread = querySnapshot.docs.filter(doc => !doc.data().isRead).length;
          setUnreadCount(unread);
        });

        return () => unsubscribe();
      }
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
          <div className="notification-bell" onClick={() => setShowNotifications(true)}>
            <FaBell className="bell-icon" />
            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
          </div>
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

      <Notifications isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
    </>
  );
}

export default Header;
