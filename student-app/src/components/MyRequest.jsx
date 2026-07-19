import { useState, useEffect } from 'react';
import { MdSearch, MdNotifications, MdKeyboardArrowLeft, MdKeyboardArrowRight } from 'react-icons/md';
import '../styles/MyRequest.css';

function MyRequest({ onViewDetails, onNavigate }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [officeFilter, setOfficeFilter] = useState('All Offices');
  const [currentPage, setCurrentPage] = useState(1);
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);

  useEffect(() => {
    // TODO: Fetch requests from database
    // This will be implemented when connecting to Firebase
    loadRequests();
  }, []);

  useEffect(() => {
    // Filter requests based on search and filters
    filterRequests();
  }, [searchQuery, statusFilter, officeFilter, requests]);

  const loadRequests = async () => {
    // TODO: Replace with actual Firebase query
    // const studentId = localStorage.getItem('studentId');
    // const requestsRef = collection(db, 'requests');
    // const q = query(requestsRef, where('studentId', '==', studentId));
    // const snapshot = await getDocs(q);
    setRequests([]);
  };

  const filterRequests = () => {
    let filtered = [...requests];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(req => 
        req.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.subject.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'All Status') {
      filtered = filtered.filter(req => req.status === statusFilter);
    }

    // Office filter
    if (officeFilter !== 'All Offices') {
      filtered = filtered.filter(req => req.office === officeFilter);
    }

    setFilteredRequests(filtered);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('All Status');
    setOfficeFilter('All Offices');
  };

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

        <button className="reset-btn" onClick={handleResetFilters}>Reset Filters</button>
      </div>

      <div className="request-table">
        {filteredRequests.length === 0 ? (
          <div className="empty-state">
            <p>No requests found. {searchQuery || statusFilter !== 'All Status' || officeFilter !== 'All Offices' ? 'Try adjusting your filters.' : 'Create your first request to get started!'}</p>
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
              {filteredRequests.map((req, index) => (
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
        )}
      </div>

      <div className="pagination">
        <button className="page-btn" disabled={currentPage === 1}>
          <MdKeyboardArrowLeft />
        </button>
        <button className={`page-num ${currentPage === 1 ? 'active' : ''}`} onClick={() => setCurrentPage(1)}>1</button>
        <button className="page-btn">
          <MdKeyboardArrowRight />
        </button>
      </div>
    </div>
  );
}

export default MyRequest;
