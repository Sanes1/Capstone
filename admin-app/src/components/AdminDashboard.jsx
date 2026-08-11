import { useState, useEffect, useMemo, useRef } from 'react';
import { FaBell, FaInbox, FaTicketAlt, FaClipboard, FaCheckCircle, FaUserCircle } from 'react-icons/fa';
import { db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import Notifications from './Notifications';
import { notifyStudentStatusChange } from '../utils/notificationHelper';
import { useOfficeTickets } from '../hooks/useOfficeTickets';
import LoadingSpinner from './LoadingSpinner';
import '../styles/AdminDashboard.css';

const AdminDashboard = ({ department, onNavigate, onViewRequest }) => {
  const [activeTab, setActiveTab] = useState('all');
  const [timeFilter, setTimeFilter] = useState('month');
  const { tickets, loading } = useOfficeTickets(department);
  const [staffData, setStaffData] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const ticketsSectionRef = useRef(null);

  useEffect(() => {
    // Get staff data from localStorage
    const storedStaffData = localStorage.getItem('staffData');
    if (storedStaffData) {
      setStaffData(JSON.parse(storedStaffData));
    }
  }, []);

  // Dashboard summary cards — derived straight from the shared live tickets
  const stats = useMemo(() => ({
    total: tickets.length,
    // Cancelled tickets have no assignee but are NOT awaiting assignment
    unassigned: tickets.filter(t => !t.assignedTo && t.status !== 'Cancelled').length,
    claimed: tickets.filter(t => t.status === 'In Process').length,
    resolved: tickets.filter(t => t.status === 'Resolved').length
  }), [tickets]);

  const filteredTickets = useMemo(() => {
    let filtered = [...tickets];

    // Filter by tab
    if (activeTab === 'new') {
      // Cancelled tickets aren't "new" — they only match because they have
      // no assignee, so exclude them explicitly.
      filtered = filtered.filter(t => t.status !== 'Cancelled' && (t.status === 'Pending' || !t.assignedTo));
    } else if (activeTab === 'progress') {
      filtered = filtered.filter(t => t.status === 'In Process');
    } else if (activeTab === 'resolved') {
      filtered = filtered.filter(t => t.status === 'Resolved');
    }

    return filtered;
  }, [activeTab, tickets]);

  // Stat cards double as quick filters: clicking one switches the ticket
  // table to the matching tab (All / New Tickets / In Progress / Resolved)
  // and scrolls it into view. Clicking the already-active card resets to All.
  const handleStatCardClick = (tab) => {
    setActiveTab((prev) => (prev === tab ? 'all' : tab));
    ticketsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleClaimTicket = async (ticket) => {
    if (!staffData) {
      alert('Staff data not found. Please login again.');
      return;
    }

    try {
      // Update ticket in Firestore (the shared live listener refreshes the UI)
      const ticketRef = doc(db, 'requests', ticket.firestoreId);
      await updateDoc(ticketRef, {
        assignedTo: staffData.name,
        assignedToStaff: staffData.name,
        status: 'In Process',
        claimedAt: new Date(),
        claimedBy: staffData.name
      });

      console.log('✅ Ticket claimed by', staffData.name);

      // Create notification for the student about status change
      if (ticket.studentUid) {
        await notifyStudentStatusChange(
          ticket.studentUid,
          ticket.id,
          ticket.title,
          ticket.status || 'Pending',
          'In Process'
        );
        console.log('✅ Notification sent to student');
      } else {
        console.warn('⚠️ Student UID not found in ticket, notification not sent');
      }

      alert(`Ticket ${ticket.id} has been assigned to you!`);
    } catch (error) {
      console.error('❌ Error claiming ticket:', error);
      alert('Failed to claim ticket: ' + error.message);
    }
  };

  return (
    <div className="admin-dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">{department}'s Office</h1>
          <p className="dashboard-subtitle">Monitor and manage all student requests in your office</p>
        </div>
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
          <div className="notification-bell" onClick={() => setShowNotifications(true)}>
            <FaBell className="bell-icon" />
            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
          </div>
        </div>
      </div>

      <div className="stats-cards">
        <button
          type="button"
          className={`stat-card ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => handleStatCardClick('all')}
          aria-pressed={activeTab === 'all'}
          aria-label="Show all tickets in the dashboard table"
        >
          <span className="stat-header">
            <span className="stat-icon-container">
              <FaInbox className="stat-icon" />
            </span>
            <span className="stat-label">Total</span>
          </span>
          <span className="stat-value">{stats.total}</span>
          <span className="stat-subtext">All Tickets</span>
        </button>

        <button
          type="button"
          className={`stat-card ${activeTab === 'new' ? 'active' : ''}`}
          onClick={() => handleStatCardClick('new')}
          aria-pressed={activeTab === 'new'}
          aria-label="Show new tickets awaiting assignment in the dashboard table"
        >
          <span className="stat-header">
            <span className="stat-icon-container">
              <FaTicketAlt className="stat-icon" />
            </span>
            <span className="stat-label">Open</span>
          </span>
          <span className="stat-value">{stats.unassigned}</span>
          <span className="stat-subtext">Awaiting Assignment</span>
        </button>

        <button
          type="button"
          className={`stat-card ${activeTab === 'progress' ? 'active' : ''}`}
          onClick={() => handleStatCardClick('progress')}
          aria-pressed={activeTab === 'progress'}
          aria-label="Show in progress tickets in the dashboard table"
        >
          <span className="stat-header">
            <span className="stat-icon-container">
              <FaClipboard className="stat-icon" />
            </span>
            <span className="stat-label">In Progress</span>
          </span>
          <span className="stat-value">{stats.claimed}</span>
          <span className="stat-subtext">Being Handled</span>
        </button>

        <button
          type="button"
          className={`stat-card ${activeTab === 'resolved' ? 'active' : ''}`}
          onClick={() => handleStatCardClick('resolved')}
          aria-pressed={activeTab === 'resolved'}
          aria-label="Show resolved tickets in the dashboard table"
        >
          <span className="stat-header">
            <span className="stat-icon-container">
              <FaCheckCircle className="stat-icon" />
            </span>
            <span className="stat-label">Resolved</span>
          </span>
          <span className="stat-value">{stats.resolved}</span>
          <span className="stat-subtext">Completed</span>
        </button>
      </div>

      <div className="tickets-section" ref={ticketsSectionRef}>
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

        {loading ? (
          <LoadingSpinner message="Loading tickets..." fullScreen={false} />
        ) : filteredTickets.length === 0 ? (
          <div className="empty-state">No tickets found.</div>
        ) : (
          <>
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
                {filteredTickets.map((ticket, index) => (
                  <tr key={ticket.firestoreId || index}>
                    <td>
                      <div className="ticket-info-cell">
                        {ticket.title}
                        <span className="ticket-id">#{ticket.id}</span>
                      </div>
                    </td>
                    <td>
                      <div className="student-info">
                        {ticket.student}
                        <span className="student-id">ID: {ticket.studentId}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge status-${ticket.status.toLowerCase().replace(' ', '')}`}>
                        {ticket.status === 'Pending' && 'New Ticket'}
                        {ticket.status === 'In Process' && 'In Progress'}
                        {ticket.status === 'Resolved' && 'Resolved'}
                        {ticket.status === 'Cancelled' && 'Cancelled'}
                      </span>
                    </td>
                    <td>
                      {ticket.status === 'Cancelled' ? (
                        <span className="cancelled-text">Cancelled by Student</span>
                      ) : ticket.assignedTo ? (
                        <div className="assigned-to">
                          <FaUserCircle className="assigned-icon" />
                          <span>{ticket.assignedTo}</span>
                        </div>
                      ) : (
                        <span className="unassigned-text">Unassigned</span>
                      )}
                    </td>
                    <td>
                      {ticket.status === 'Cancelled' ? (
                        <button className="action-btn disabled" disabled>
                          Cancelled
                        </button>
                      ) : ticket.assignedTo ? (
                        <button
                          className="action-btn"
                          onClick={() => onNavigate('ticket-details', ticket)}
                        >
                          View Ticket
                        </button>
                      ) : (
                        <button
                          className="action-btn claim"
                          onClick={() => handleClaimTicket(ticket)}
                        >
                          Claim Ticket
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="pagination">
              <button className="page-btn">&lt;</button>
              <button className="page-btn active">1</button>
              <button className="page-btn">&gt;</button>
            </div>
          </>
        )}
      </div>

      <Notifications isOpen={showNotifications} onClose={() => setShowNotifications(false)} onViewRequest={onViewRequest} />
    </div>
  );
};

export default AdminDashboard;
