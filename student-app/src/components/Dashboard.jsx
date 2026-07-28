import { useState, useEffect } from 'react';
import { MdAdd, MdNotifications, MdConfirmationNumber } from 'react-icons/md';
import { FaTimes, FaCheckCircle, FaExclamationCircle, FaBell } from 'react-icons/fa';
import { HiOutlineDocumentAdd, HiOutlineDocumentText, HiOutlineCheckCircle } from 'react-icons/hi';
import { db } from '../firebase';
import { collection, query, where, getDocs, doc, updateDoc, orderBy, limit } from 'firebase/firestore';
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
  const [loading, setLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Get student info from localStorage
    const studentData = localStorage.getItem('studentData');
    if (studentData) {
      const student = JSON.parse(studentData);
      const fullName = student.firstName && student.lastName 
        ? `${student.firstName} ${student.lastName}`
        : student.name || 'Student';
      setStudentName(fullName);
      
      // Use studentId, fallback to id or uid
      const identifier = student.studentId || student.id || student.uid;
      loadRequests(identifier, student.uid);
    }
  }, []);

  const loadRequests = async (studentId, studentUid) => {
    try {
      setLoading(true);
      
      // Query all requests for this student
      const requestsRef = collection(db, 'requests');
      let q = query(
        requestsRef,
        where('studentId', '==', studentId)
      );
      
      let querySnapshot = await getDocs(q);
      
      // If no results, try with studentUid
      if (querySnapshot.empty && studentUid) {
        q = query(
          requestsRef,
          where('studentUid', '==', studentUid)
        );
        querySnapshot = await getDocs(q);
      }
      
      const allRequests = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          firestoreId: doc.id,
          id: data.requestId,
          office: data.office,
          subject: data.subject,
          date: data.createdAt?.toDate().toLocaleDateString('en-US', { 
            month: 'long', 
            day: 'numeric', 
            year: 'numeric' 
          }) || 'N/A',
          status: data.status,
          createdAtTimestamp: data.createdAt?.toDate().getTime() || 0,
          ...data
        };
      });

      // Sort by date manually (newest first)
      allRequests.sort((a, b) => b.createdAtTimestamp - a.createdAtTimestamp);

      // Calculate stats
      const newStats = {
        total: allRequests.length,
        pending: allRequests.filter(r => r.status === 'Pending').length,
        inProgress: allRequests.filter(r => r.status === 'In Process').length,
        resolved: allRequests.filter(r => r.status === 'Resolved').length
      };

      setStats(newStats);
      
      // Get recent 5 requests
      setRequests(allRequests.slice(0, 5));
      
      console.log('✅ Dashboard loaded:', newStats.total, 'total requests');
    } catch (error) {
      console.error('❌ Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadNotifications = async () => {
    try {
      const studentData = JSON.parse(localStorage.getItem('studentData'));
      if (!studentData) return;

      const notificationsRef = collection(db, 'notifications');
      const q = query(
        notificationsRef,
        where('userId', '==', studentData.uid),
        where('userType', '==', 'student'),
        orderBy('createdAt', 'desc'),
        limit(10)
      );

      const querySnapshot = await getDocs(q);
      const notificationsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      }));

      setNotifications(notificationsData);
      setUnreadCount(notificationsData.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const notifRef = doc(db, 'notifications', notificationId);
      await updateDoc(notifRef, { read: true });
      
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.read);
      
      for (const notification of unreadNotifications) {
        const notifRef = doc(db, 'notifications', notification.id);
        await updateDoc(notifRef, { read: true });
      }
      
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const getTimeAgo = (date) => {
    if (!date) return '';
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'reply':
      case 'status_update':
        return <FaCheckCircle className="notif-icon success" />;
      case 'return':
      case 'urgent':
        return <FaExclamationCircle className="notif-icon warning" />;
      default:
        return <FaBell className="notif-icon" />;
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
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
          <div className="notification-container">
            <button 
              className="notification-btn"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <MdNotifications />
              {unreadCount > 0 && (
                <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
              )}
            </button>

            {showNotifications && (
              <>
                <div className="notification-overlay" onClick={() => setShowNotifications(false)} />
                <div className="notification-dropdown">
                  <div className="notification-header">
                    <h3>Notifications</h3>
                    {unreadCount > 0 && (
                      <button 
                        className="mark-all-read-btn"
                        onClick={markAllAsRead}
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  <div className="notification-list">
                    {notifications.length === 0 ? (
                      <div className="no-notifications">
                        <FaBell className="no-notif-icon" />
                        <p>No notifications yet</p>
                      </div>
                    ) : (
                      notifications.map(notification => (
                        <div
                          key={notification.id}
                          className={`notification-item ${!notification.read ? 'unread' : ''}`}
                          onClick={() => {
                            if (!notification.read) markAsRead(notification.id);
                            setShowNotifications(false);
                          }}
                        >
                          {getNotificationIcon(notification.type)}
                          <div className="notification-content">
                            <p className="notification-title">{notification.title}</p>
                            <p className="notification-message">{notification.message}</p>
                            <span className="notification-time">{getTimeAgo(notification.createdAt)}</span>
                          </div>
                          {!notification.read && <div className="unread-dot" />}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
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
          {loading ? (
            <div className="empty-state">
              <p>Loading requests...</p>
            </div>
          ) : requests.length === 0 ? (
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
                  <tr key={req.firestoreId || index}>
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
