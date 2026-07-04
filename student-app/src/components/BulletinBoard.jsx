import { MdNotifications } from 'react-icons/md';
import '../styles/BulletinBoard.css';

function BulletinBoard() {
  const announcements = [
    {
      id: 1,
      office: 'FINANCE',
      title: 'Extended hours',
      description: 'Please be informed that the Finance Office will extend its operating hours from 6:00 AM to 6:00 PM to better accommodate students and parents. You may visit within this time for payments, balance inquiries, and other finance-related concerns. Thank you.',
      image: '/finance-announcement.png'
    },
    {
      id: 2,
      office: 'LIBRARY',
      title: 'Extended hours',
      description: 'Please be informed that the Library will extend its operating hours from 6:00 AM to 8:00 PM to accommodate students processing their clearance. You may visit within this time to settle library obligations and complete your clearance. Thank you.',
      image: '/library-announcement.png'
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
          <h2>FINAL LISTING FOR 2026 GRADUATION</h2>
          <p>Ensure all academic record is clear and all department requirements are met by March 25.</p>
        </div>
      </div>

      <div className="bulletin-content">
        <div className="announcements-section">
          <h3>Announcements</h3>
          
          {announcements.map((announcement) => (
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
          ))}
        </div>

        <div className="deadlines-section">
          <div className="deadlines-header">
            <span>📅</span>
            <h3>Important Deadlines</h3>
          </div>
          
          {deadlines.map((deadline, index) => (
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
          ))}
        </div>
      </div>
    </div>
  );
}

export default BulletinBoard;
