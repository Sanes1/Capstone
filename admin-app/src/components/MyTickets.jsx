import React, { useState } from 'react';
import { FaBell, FaSearch, FaTicketAlt, FaEllipsisH, FaCheckCircle, FaChevronRight } from 'react-icons/fa';
import '../styles/MyTickets.css';

const MyTickets = ({ department, onNavigate }) => {
  const [timeFilter, setTimeFilter] = useState('week');

  const handleTicketClick = () => {
    onNavigate('ticket-details');
  };

  const tickets = [
    { id: '#FIN-123-654-789', title: 'TUITION PAYMENT', student: 'RICKY LIAM', studentId: '05-2324-12345', assignedTo: 'Alex Smith', status: 'In Progress' },
    { id: '#FIN-123-654-789', title: 'GRAND TOTAL', student: 'JANE DOE', studentId: '05-2324-12345', assignedTo: 'Alex Smith', status: 'Rejected' },
    { id: '#FIN-123-654-789', title: 'DOWN PAYMENT', student: 'ANNA MARIE', studentId: '05-2324-12345', assignedTo: 'Alex Smith', status: 'Resolved' },
    { id: '#FIN-123-654-789', title: 'TUITION FEE', student: 'JOHN MARK', studentId: '05-2324-12345', assignedTo: 'Alex Smith', status: 'Resolved' },
    { id: '#FIN-123-654-789', title: 'ASSESSMENT FEE', student: 'JAYSONN MILLER', studentId: '05-2324-12345', assignedTo: 'Alex Smith', status: 'Resolved' },
  ];

  return (
    <div className="my-tickets-container">
      <div className="breadcrumb">
        <span className="breadcrumb-item">Tickets</span>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-item clickable" onClick={handleTicketClick}>
          Ticket Details
        </span>
      </div>

      <div className="page-header">
        <h1 className="page-title">My Tickets</h1>
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

      <div className="ticket-summary-cards">
        <div className="summary-card new">
          <div className="summary-content">
            <h3>New Tickets</h3>
            <div className="summary-count">5</div>
          </div>
          <div className="summary-icon-container">
            <FaTicketAlt className="summary-icon" />
          </div>
        </div>

        <div className="summary-card progress">
          <div className="summary-content">
            <h3>In Process</h3>
            <div className="summary-count">1</div>
          </div>
          <div className="summary-icon-container">
            <FaEllipsisH className="summary-icon" />
          </div>
        </div>

        <div className="summary-card resolved">
          <div className="summary-content">
            <h3>Resolved</h3>
            <div className="summary-count">4</div>
          </div>
          <div className="summary-icon-container">
            <FaCheckCircle className="summary-icon" />
          </div>
        </div>
      </div>

      <div className="filters-section">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input type="text" placeholder="Search by Ticket Info" />
        </div>
        <select className="filter-dropdown">
          <option>All Status</option>
          <option>New Tickets</option>
          <option>In Progress</option>
          <option>Resolved</option>
          <option>Rejected</option>
        </select>
        <button className="reset-filter-btn">Reset Filters</button>
      </div>

      <div className="tickets-list-section">
        <table className="tickets-list-table">
          <thead>
            <tr>
              <th className="checkbox-cell"></th>
              <th>STUDENT DETAILS</th>
              <th>TICKET INFO</th>
              <th>ASSIGNED TO</th>
              <th>STATUS</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket, index) => (
              <tr key={index} onClick={handleTicketClick} style={{ cursor: 'pointer' }}>
                <td className="checkbox-cell">
                  <input type="checkbox" className="ticket-checkbox" onClick={(e) => e.stopPropagation()} />
                </td>
                <td>
                  <div className="student-cell">
                    {ticket.student}
                    <span className="student-id-text">ID: {ticket.studentId}</span>
                  </div>
                </td>
                <td>
                  <div className="ticket-info-text">
                    {ticket.title}
                    <span className="ticket-number">{ticket.id}</span>
                  </div>
                </td>
                <td>
                  <span className="assigned-name">{ticket.assignedTo}</span>
                </td>
                <td>
                  <span className={`status-text ${ticket.status.toLowerCase().replace(' ', '')}`}>
                    {ticket.status}
                  </span>
                </td>
                <td>
                  <FaChevronRight className="arrow-icon" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="pagination-tickets">
          <button className="page-btn-tickets">&lt;</button>
          <button className="page-btn-tickets active">1</button>
          <button className="page-btn-tickets">2</button>
          <button className="page-btn-tickets">3</button>
          <button className="page-btn-tickets">4</button>
          <button className="page-btn-tickets">&gt;</button>
        </div>
      </div>
    </div>
  );
};

export default MyTickets;
