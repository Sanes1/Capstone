import React, { useState, useEffect } from 'react';
import { FaBell, FaTimes, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import { collection, query, where, getDocs, doc, updateDoc, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import '../styles/Notifications.css';

const Notifications = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadNotifications();
    // Reload notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

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
      setLoading(true);
      const unreadNotifications = notifications.filter(n => !n.read);
      
      for (const notification of unreadNotifications) {
        const notifRef = doc(db, 'notifications', notification.id);
        await updateDoc(notifRef, { read: true });
      }
      
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    } finally {
      setLoading(false);
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

  return (
    <div className="notifications-container">
      <button 
        className="notification-bell-btn"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <FaBell />
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {showDropdown && (
        <>
          <div className="notification-overlay" onClick={() => setShowDropdown(false)} />
          <div className="notification-dropdown">
            <div className="notification-header">
              <h3>Notifications</h3>
              {unreadCount > 0 && (
                <button 
                  className="mark-all-read-btn"
                  onClick={markAllAsRead}
                  disabled={loading}
                >
                  {loading ? 'Marking...' : 'Mark all as read'}
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
                      setShowDropdown(false);
                      // Navigate to request if linkTo exists
                      if (notification.linkTo) {
                        // Handle navigation here
                      }
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
  );
};

export default Notifications;
