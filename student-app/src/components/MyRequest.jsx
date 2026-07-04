import React, { useState } from 'react';
import { MdSearch, MdNotifications, MdKeyboardArrowLeft, MdKeyboardArrowRight } from 'react-icons/md';
import '../styles/MyRequest.css';

function MyRequest({ onViewDetails, onNavigate }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [officeFilter, setOfficeFilter] = useState('All Offices');
  const [currentPage, setCurrentPage] = useState(1);

  const requests = [
    { id: 'FIN-123-654-789', office: 'Finance', subject: 'Tuition Payment', date: 'February 16, 2026', status: 'In Process' },
    { id: 'LIB-123-654-789', office: 'Library', subject: 'Book Distribution', date: 'February 16, 2026', status: 'Resolved' },
    { id: 'REG-123-654-789', office: 'Registrar', subject: 'Good Morale', date: 'February 16, 2026', status: 'Pending' },
    { id: 'GUI-123-654-789', office: 'Guidance', subject: 'Counseling', date: 'February 16, 2026', status: 'Resolved' },
    { id: 'FIN-123-654-789', office: 'Finance', subject: 'Grand Total', date: 'February 16, 2026', status: 'Resolved' }
  ];

  return (
    <div className="my-request">
      <div className="breadcrumb">
        <span className="active">Request History</span>
        <span className="separator">/</span>
        <span className="clickable" onClick={() => onNavigate('request-details')}>Request Details</span>
        <span className="separator">/</span>
        <span className="clickable" onClick={() => onNavigate('new-request')}>New Request</span>
      </div>

      <div className="page-header">
        <h1>Request History</h1>
        <div className="header-actions">
          <button className="notification-btn">
            <MdNotifications />
          </button>
        </div>
      </div>

      <div className="filters">
        <div className="search-box">
          <MdSearch />
          <input 
            type="text" 
            placeholder="Search by Ticket or Subject"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option>All Status</option>
          <option>In Process</option>
          <option>Resolved</option>
          <option>Pending</option>
        </select>

        <select value={officeFilter} onChange={(e) => setOfficeFilter(e.target.value)}>
          <option>All Offices</option>
          <option>Finance</option>
          <option>Library</option>
          <option>Registrar</option>
          <option>Guidance</option>
        </select>

        <button className="reset-btn">Reset Filters</button>
      </div>

      <div className="request-table">
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
              <tr key={index} onClick={onViewDetails} style={{ cursor: 'pointer' }}>
                <td>#{req.id}</td>
                <td>{req.office}</td>
                <td>{req.subject}</td>
                <td>{req.date}</td>
                <td>
                  <span className={`status ${req.status.toLowerCase().replace(' ', '-')}`}>
                    {req.status}
                  </span>
                </td>
                <td>›</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <button className="page-btn" disabled={currentPage === 1}>
          <MdKeyboardArrowLeft />
        </button>
        <button className={`page-num ${currentPage === 1 ? 'active' : ''}`} onClick={() => setCurrentPage(1)}>1</button>
        <button className={`page-num ${currentPage === 2 ? 'active' : ''}`} onClick={() => setCurrentPage(2)}>2</button>
        <button className={`page-num ${currentPage === 3 ? 'active' : ''}`} onClick={() => setCurrentPage(3)}>3</button>
        <button className={`page-num ${currentPage === 4 ? 'active' : ''}`} onClick={() => setCurrentPage(4)}>4</button>
        <button className="page-btn">
          <MdKeyboardArrowRight />
        </button>
      </div>
    </div>
  );
}

export default MyRequest;
