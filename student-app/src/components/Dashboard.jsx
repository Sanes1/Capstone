import { useState, useEffect } from 'react';
import { MdAdd, MdNotifications, MdConfirmationNumber } from 'react-icons/md';
import { HiOutlineDocumentAdd, HiOutlineDocumentText, HiOutlineCheckCircle } from 'react-icons/hi';
import '../styles/Dashboard.css';

function Dashboard() {
  const [studentName, setStudentName] = useState('');
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0
  });

  useEffect(() => {
    // Get student info from localStorage
    const studentData = localStorage.getItem('studentData');
    if (studentData) {
      const student = JSON.parse(studentData);
      setStudentName(student.name || 'Student');
    }

    // TODO: Fetch requests from database
    // This will be implemented when connecting to Firebase
    // For now, showing empty state
  }, []);

  return (
    <div className="dashboard">
      <div className="breadcrumb-placeholder"></div>
      
      <div className="content-header">
        <h1>Welcome back, {studentName}</h1>
        <div className="header-actions">
          <button className="create-btn">
            <MdAdd /> CREATE NEW REQUEST
          </button>
          <button className="notification-btn">
            <MdNotifications />
          </button>
        </div>
      </div>

      <div className="stats">
        <div className="stat-card total">
          <span>TOTAL</span>
          <div className="icon"><MdConfirmationNumber /></div>
          <h2>All Request</h2>
          <div className="number">{stats.total}</div>
        </div>
        <div className="stat-card submitted">
          <span>SUBMITTED</span>
          <div className="icon"><HiOutlineDocumentAdd /></div>
          <h2>Pending Request</h2>
          <div className="number">{stats.pending}</div>
        </div>
        <div className="stat-card active">
          <span>ACTIVE</span>
          <div className="icon"><HiOutlineDocumentText /></div>
          <h2>In Progress</h2>
          <div className="number">{stats.inProgress}</div>
        </div>
        <div className="stat-card complete">
          <span>COMPLETE</span>
          <div className="icon"><HiOutlineCheckCircle /></div>
          <h2>Resolved</h2>
          <div className="number">{stats.resolved}</div>
        </div>
      </div>

      <section className="recent-requests">
        <div className="section-header">
          <h2>Recent Request</h2>
          <a href="#">View all My Request →</a>
        </div>
        
        <div className="table-container">
          {requests.length === 0 ? (
            <div className="empty-state">
              <p>No requests yet. Create your first request to get started!</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>REQUEST ID</th>
                  <th>OFFICE</th>
                  <th>SUBJECT</th>
                  <th>DATE SUBMITTED</th>
                  <th>STATUS</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req, index) => (
                  <tr key={index}>
                    <td>#{req.id}</td>
                    <td>{req.office}</td>
                    <td>{req.subject}</td>
                    <td>{req.date}</td>
                    <td><span className={`status ${req.status.toLowerCase().replace(' ', '-')}`}>{req.status}</span></td>
                    <td>›</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
