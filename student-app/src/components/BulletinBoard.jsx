import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import LoadingSpinner from './LoadingSpinner';
import Breadcrumb from './Breadcrumb';
import '../styles/BulletinBoard.css';

function BulletinBoard() {
  const [announcements, setAnnouncements] = useState([]);
  const [deadlines, setDeadlines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeAnnouncements = null;
    let unsubscribeDeadlines = null;

    try {
      // Load all announcements (from all offices)
      const announcementsQuery = query(
        collection(db, 'announcements'),
        orderBy('createdAt', 'desc')
      );

      unsubscribeAnnouncements = onSnapshot(announcementsQuery, (querySnapshot) => {
        const announcementsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setAnnouncements(announcementsData);
        setLoading(false);
      }, (error) => {
        console.error('❌ Error loading announcements:', error);
        setLoading(false);
      });

      // Load all important dates (from all offices) - students see all deadlines
      const deadlinesQuery = query(
        collection(db, 'importantDates'),
        orderBy('dateValue', 'asc')
      );

      unsubscribeDeadlines = onSnapshot(deadlinesQuery, (querySnapshot) => {
        const deadlinesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setDeadlines(deadlinesData);
      }, (error) => {
        console.error('❌ Error loading deadlines:', error);
      });
    } catch (error) {
      console.error('❌ Error loading bulletin data:', error);
      setLoading(false);
    }

    return () => {
      if (unsubscribeAnnouncements) unsubscribeAnnouncements();
      if (unsubscribeDeadlines) unsubscribeDeadlines();
    };
  }, []);

  // Mark announcements as read when user views the bulletin board
  useEffect(() => {
    if (announcements.length > 0) {
      const announcementIds = announcements.map(a => a.id);
      localStorage.setItem('readAnnouncements', JSON.stringify(announcementIds));
    }
  }, [announcements]);

  return (
    <div className="bulletin-board-page">
      <Breadcrumb items={[{ label: 'Bulletin Board', current: true }]} />

      <div className="page-header">
        <h1>Bulletin Board</h1>
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
          
          {loading ? (
            <LoadingSpinner message="Loading announcements..." fullScreen={false} />
          ) : announcements.length === 0 ? (
            <div className="empty-state">
              <p>No announcements at this time. Check back later for updates!</p>
            </div>
          ) : (
            announcements.map((announcement) => (
              <div key={announcement.id} className="announcement-card">
                {announcement.photo && (
                  <div className="announcement-image">
                    <img src={announcement.photo} alt={announcement.title} className="announcement-photo" />
                  </div>
                )}
                <div className="announcement-details">
                  <div className="announcement-office">{announcement.department}</div>
                  <h4>{announcement.title}</h4>
                  <p>{announcement.body}</p>
                  <div className="announcement-footer">
                    <span className="announcement-author">By {announcement.createdBy}</span>
                  </div>
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
            deadlines.map((deadline) => (
              <div key={deadline.id} className="deadline-item">
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
