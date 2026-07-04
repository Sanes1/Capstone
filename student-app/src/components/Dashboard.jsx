import React from 'react';
import { MdAdd, MdNotifications, MdConfirmationNumber } from 'react-icons/md';
import { HiOutlineDocumentAdd, HiOutlineDocumentText, HiOutlineCheckCircle } from 'react-icons/hi';
import '../styles/Dashboard.css';

function Dashboard() {
  const requests = [
    { id: 'FIN-123-654-789', office: 'Finance', subject: 'Tuition Payment', date: 'February 16, 2026', status: 'In Process' },
    { id: 'LIB-123-654-789', office: 'Library', subject: 'Book Distribution', date: 'February 16, 2026', status: 'Resolved' },
    { id: 'FIN-123-654-789', office: 'Registrar', subject: 'Good Morale', date: 'February 16, 2026', status: 'Resolved' },
    { id: 'GUI-123-654-789', office: 'Guidance', subject: 'Counseling', date: 'February 16, 2026', status: 'Resolved' },
    { id: 'REG-123-654-789', office: 'Finance', subject: 'Grand Total', date: 'February 16, 2026', status: 'Resolved' }
  ];

  return (
    <div className="dashboard">
      <div className="breadcrumb-placeholder"></div>
      
      <div className="content-header">
        <h1>Welcome back, Ricky</h1>
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
          <div className="number">15</div>
        </div>
        <div className="stat-card submitted">
          <span>SUBMITTED</span>
          <div className="icon"><HiOutlineDocumentAdd /></div>
          <h2>Pending Request</h2>
          <div className="number">0</div>
        </div>
        <div className="stat-card active">
          <span>ACTIVE</span>
          <div className="icon"><HiOutlineDocumentText /></div>
          <h2>In Progress</h2>
          <div className="number">1</div>
        </div>
        <div className="stat-card complete">
          <span>COMPLETE</span>
          <div className="icon"><HiOutlineCheckCircle /></div>
          <h2>Resolved</h2>
          <div className="number">10</div>
        </div>
      </div>

      <section className="recent-requests">
        <div className="section-header">
          <h2>Recent Request</h2>
          <a href="#">View all My Request →</a>
        </div>
        
        <div className="table-container">
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
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
