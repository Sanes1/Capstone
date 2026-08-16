import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import LoadingSpinner from './LoadingSpinner';
import AnnouncementCard from './AnnouncementCard';
import '../styles/BulletinBoard.css';

// Default hero shown until an office saves a featured announcement
const DEFAULT_HERO = {
  office: '',
  title: 'Welcome to the Bulletin Board',
  body: 'Stay updated with the latest announcements and important deadlines'
};

function BulletinBoard() {
  const [announcements, setAnnouncements] = useState([]);
  const [deadlines, setDeadlines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hero, setHero] = useState(DEFAULT_HERO);

  useEffect(() => {
    let unsubscribeAnnouncements = null;
    let unsubscribeDeadlines = null;
    let unsubscribeHero = null;

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

      // Load all important dates (from all offices) - students see all deadlines.
      // No orderBy in the query so no composite index is required — sorted
      // client-side instead (matches the admin app).
      const deadlinesQuery = query(
        collection(db, 'importantDates')
      );

      unsubscribeDeadlines = onSnapshot(deadlinesQuery, (querySnapshot) => {
        const deadlinesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        deadlinesData.sort((a, b) => (a.dateValue || 0) - (b.dateValue || 0));
        setDeadlines(deadlinesData);
      }, (error) => {
        console.error('❌ Error loading deadlines:', error);
      });

      // Featured (semestral) announcement — the most recently updated one
      // across all offices, shown as the hero banner.
      unsubscribeHero = onSnapshot(collection(db, 'bulletinHero'), (querySnapshot) => {
        const heroes = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        heroes.sort((a, b) => {
          const aTime = a.updatedAt?.toDate ? a.updatedAt.toDate().getTime() : 0;
          const bTime = b.updatedAt?.toDate ? b.updatedAt.toDate().getTime() : 0;
          return bTime - aTime;
        });
        const latest = heroes[0];
        if (latest && (latest.title || latest.body)) {
          setHero({
            office: latest.office || '',
            title: latest.title || DEFAULT_HERO.title,
            body: latest.body || DEFAULT_HERO.body
          });
        } else {
          setHero(DEFAULT_HERO);
        }
      }, (error) => {
        console.error('❌ Error loading featured announcement:', error);
        setHero(DEFAULT_HERO);
      });
    } catch (error) {
      console.error('❌ Error loading bulletin data:', error);
      setLoading(false);
    }

    return () => {
      if (unsubscribeAnnouncements) unsubscribeAnnouncements();
      if (unsubscribeDeadlines) unsubscribeDeadlines();
      if (unsubscribeHero) unsubscribeHero();
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
      <div className="page-header">
        <h1>Bulletin Board</h1>
      </div>

      <div className="hero-banner">
        <div className="hero-overlay">
          {hero.office && (
            <span className="hero-kicker">{hero.office} OFFICE</span>
          )}
          <h2 className="hero-title">{hero.title}</h2>
          <p className="hero-subtitle">{hero.body}</p>
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
              <AnnouncementCard key={announcement.id} announcement={announcement} />
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
                  <div className="day">{parseInt(deadline.day, 10) || deadline.day}</div>
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
