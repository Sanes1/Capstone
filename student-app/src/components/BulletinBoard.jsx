import { useState, useEffect } from 'react';
import { MdNotifications } from 'react-icons/md';
import '../styles/BulletinBoard.css';

function BulletinBoard() {
  const [announcements, setAnnouncements] = useState([]);
  const [deadlines, setDeadlines] = useState([]);

  useEffect(() => {
    // TODO: Fetch announcements and deadlines from database
    // This will be implemented when connecting to Firebase
    loadBulletinData();
  }, []);

  const loadBulletinData = async () => {
    // TODO: Replace with actual Firebase queries
    // const announcementsRef = collection(db, 'announcements');
    // const deadlinesRef = collection(db, 'deadlines');
    // const announcementsSnapshot = await getDocs(query(announcementsRef, orderBy('createdAt', 'desc')));
    // const deadlinesSnapshot = await getDocs(query(deadlinesRef, orderBy('date', 'asc')));
    setAnnouncements([]);
    setDeadlines([]);
  };

  return (
    <div className="bulletin-board-page">
      <div className="breadcrumb-placeholder"></div>

      <div className="page-header">
        <h1>Bulletin Board</h1>
        <div className="header-actions">
          <button className="notification-btn">
            <MdNotifications />
          </button>
        </div>
      </div>

      <div className="hero-banner">
        <div className="hero-content">
          <h2>Welcome to the Bulletin Board</h2>
          <p>Stay updated with the latest announcements and important deadlines</p>
        </div>
      </div>

      <div className="bulletin-content">
        <div className="announcements-section">
          <h3>Announcements</h3>
          
          {announcements.length === 0 ? (
            <div className="empty-state">
              <p>No announcements at this time. Check back later for updates!</p>
            </div>
          ) : (
            announcements.map((announcement) => (
              <div key={announcement.id} className="announcement-card">
                <div className="announcement-image">
                  <div className="placeholder-image"></div>
                </div>
                <div className="announcement-details">
                  <div className="announcement-office">{announcement.office}</div>
                  <h4>{announcement.title}</h4>
                  <p>{announcement.description}</p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="deadlines-section">
          <div className="deadlines-header">
            <span>📅</span>
            <h3>Important Deadlines</h3>
          </div>
          
          {deadlines.length === 0 ? (
            <div className="empty-state-small">
              <p>No upcoming deadlines</p>
            </div>
          ) : (
            deadlines.map((deadline, index) => (
              <div key={index} className="deadline-item">
                <div className="deadline-date">
                  <div className="month">{deadline.month}</div>
                  <div className="day">{deadline.day}</div>
                </div>
                <div className="deadline-details">
                  <div className="deadline-title">{deadline.title}</div>
                  <div className="deadline-office">{deadline.office}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default BulletinBoard;
