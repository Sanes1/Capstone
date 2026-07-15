import React, { useState } from 'react';
import { FaBell, FaInbox, FaTicketAlt, FaClipboard, FaCheckCircle, FaUserCircle } from 'react-icons/fa';
import '../styles/AdminDashboard.css';

const AdminDashboard = ({ department }) => {
  const [activeTab, setActiveTab] = useState('all');
  const [timeFilter, setTimeFilter] = useState('month');

  const tickets = [
    { id: '#FIN-123-654-789', title: 'TUITION PAYMENT', student: 'RICKY LIAM', studentId: '05-2324-12345', status: 'inprogress', assignedTo: 'Alex Smith' },
    { id: '#FIN-123-654-789', title: 'GRAND TOTAL', student: 'JANE DOE', studentId: '05-2324-12345', status: 'new', assignedTo: null },
    { id: '#FIN-123-654-789', title: 'DOWN PAYMENT', student: 'ANNA MARIE', studentId: '05-2324-12345', status: 'new', assignedTo: null },
    { id: '#FIN-123-654-789', title: 'TUITION FEE', student: 'JOHN MARK', studentId: '05-2324-12345', status: 'inprogress', assignedTo: 'Anne Liam' },
    { id: '#FIN-123-654-789', title: 'ASSESSMENT FEE', student: 'JAYSONN MILLER', studentId: '05-2324-12345', status: 'resolved', assignedTo: 'Rico Micheal' },
  ];

  return (
    <div className="admin-dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">{department}'s Office</h1>
        <div className="header-right">
          <div className="time-filter">
            <button 
              className={`filter-btn ${timeFilter === 'week' ? 'active' : ''}`}
              onClick={() => setTimeFilter('week')}
            >
              Week
            </button>
            <button 
              className={`filter-btn ${timeFilter === 'month' ? 'active' : ''}`}
              onClick={() => setTimeFilter('month')}
            >
              Month
            </button>
          </div>
          <FaBell className="notification-bell" />
        </div>
      </div>

      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon-container">
              <FaInbox className="stat-icon" />
            </div>
            <span className="stat-label">TOTAL</span>
          </div>
          <div className="stat-value">15</div>
          <div className="stat-subtext">All Tickets</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon-container">
              <FaTicketAlt className="stat-icon" />
            </div>
            <span className="stat-label">UNASSIGNED</span>
          </div>
          <div className="stat-value">2</div>
          <div className="stat-subtext">Pending Tickets</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon-container">
              <FaClipboard className="stat-icon" />
            </div>
            <span className="stat-label">CLAIMED</span>
          </div>
          <div className="stat-value">1</div>
          <div className="stat-subtext">In Progress</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon-container">
              <FaCheckCircle className="stat-icon" />
            </div>
            <span className="stat-label">COMPLETE</span>
          </div>
          <div className="stat-value">10</div>
          <div className="stat-subtext">Resolved</div>
        </div>
      </div>

      <div className="tickets-section">
        <div className="tickets-tabs">
          <div className={`tab ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>
            All
          </div>
          <div className={`tab ${activeTab === 'new' ? 'active' : ''}`} onClick={() => setActiveTab('new')}>
            New Tickets
          </div>
          <div className={`tab ${activeTab === 'progress' ? 'active' : ''}`} onClick={() => setActiveTab('progress')}>
            In Progress
          </div>
          <div className={`tab ${activeTab === 'resolved' ? 'active' : ''}`} onClick={() => setActiveTab('resolved')}>
            Resolved
          </div>
        </div>

        <div className="search-bar">
          <input 
            type="text" 
            className="search-input" 
            placeholder="Search by Ticket Info or Staff Name..." 
          />
        </div>

        <table className="tickets-table">
          <thead>
            <tr>
              <th>TICKET INFO</th>
              <th>STUDENT DETAILS</th>
              <th>STATUS</th>
              <th>ASSIGNED TO</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket, index) => (
              <tr key={index}>
                <td>
                  <div className="ticket-info-cell">
                    {ticket.title}
                    <span className="ticket-id">{ticket.id}</span>
                  </div>
                </td>
                <td>
                  <div className="student-info">
                    {ticket.student}
                    <span className="student-id">ID: {ticket.studentId}</span>
                  </div>
                </td>
                <td>
                  <span className={`status-badge status-${ticket.status}`}>
                    {ticket.status === 'new' && 'New Ticket'}
                    {ticket.status === 'inprogress' && 'In Progress'}
                    {ticket.status === 'resolved' && 'Resolved'}
                  </span>
                </td>
                <td>
                  {ticket.assignedTo ? (
                    <div className="assigned-to">
                      <FaUserCircle className="assigned-icon" />
                      <span>{ticket.assignedTo}</span>
                    </div>
                  ) : (
                    <span className="unassigned-text">Unassigned</span>
                  )}
                </td>
                <td>
                  {ticket.assignedTo ? (
                    <button className="action-btn">View Ticket</button>
                  ) : (
                    <button className="action-btn claim">Claim Ticket</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="pagination">
          <button className="page-btn">&lt;</button>
          <button className="page-btn active">1</button>
          <button className="page-btn">2</button>
          <button className="page-btn">3</button>
          <button className="page-btn">4</button>
          <button className="page-btn">&gt;</button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
