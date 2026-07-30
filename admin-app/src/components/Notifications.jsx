import React, { useState, useEffect } from 'react';
import { FaBell, FaCheck, FaCheckDouble, FaTimes } from 'react-icons/fa';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { markAsRead, markAllAsRead } from '../utils/notificationHelper';
import '../styles/Notifications.css';

const Notifications = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!isOpen) return;

    const staffData = JSON.parse(localStorage.getItem('staffData'));
    if (!staffData || !staffData.uid) {
      setLoading(false);
      return;
    }

    // Simplified query to avoid index requirement - we'll sort in JavaScript
    const q = query(
      collection(db, 'notifications'),
      where('recipientId', '==', staffData.uid),
      where('recipientType', '==', 'staff')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const notifs = [];
      let unread = 0;

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        notifs.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate()
        });
        if (!data.isRead) unread++;
      });

      // Sort by date in JavaScript (newest first) and limit to 20
      notifs.sort((a, b) => {
        const timeA = a.createdAt?.getTime() || 0;
        const timeB = b.createdAt?.getTime() || 0;
        return timeB - timeA;
      });
      const limitedNotifs = notifs.slice(0, 20);

      setNotifications(limitedNotifs);
      setUnreadCount(unread);
      setLoading(false);
    }, (error) => {
      console.error('❌ Error loading notifications:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isOpen]);

  const handleMarkAsRead = async (notificationId) => {
    await markAsRead(notificationId);
  };

  const handleMarkAllAsRead = async () => {
    const staffData = JSON.parse(localStorage.getItem('staffData'));
    await markAllAsRead(staffData.uid, 'staff');
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'new_request':
        return '📋';
      case 'student_followup':
        return '💬';
      case 'ticket_rerouted':
        return '🔄';
      default:
        return '🔔';
    }
  };

  const getTimeAgo = (date) => {
    if (!date) return '';
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  if (!isOpen) return null;

  return (
    <div className="notifications-overlay" onClick={onClose}>
      <div className="notifications-panel" onClick={(e) => e.stopPropagation()}>
        <div className="notifications-header">
          <div className="notifications-header-left">
            <FaBell className="notifications-bell-icon" />
            <h2>Notifications</h2>
            {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
          </div>
          <div className="notifications-header-right">
            {unreadCount > 0 && (
              <button className="mark-all-read-btn" onClick={handleMarkAllAsRead} title="Mark all as read">
                <FaCheckDouble />
              </button>
            )}
            <button className="close-notifications-btn" onClick={onClose}>
              <FaTimes />
            </button>
          </div>
        </div>

        <div className="notifications-list">
          {loading ? (
            <div className="notifications-loading">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="notifications-empty">
              <FaBell className="empty-icon" />
              <p>No notifications yet</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className={`notification-item ${!notif.isRead ? 'unread' : ''}`}
                onClick={() => !notif.isRead && handleMarkAsRead(notif.id)}
              >
                <div className="notification-icon">{getNotificationIcon(notif.type)}</div>
                <div className="notification-content">
                  <div className="notification-title">{notif.title}</div>
                  <div className="notification-message">{notif.message}</div>
                  <div className="notification-time">{getTimeAgo(notif.createdAt)}</div>
                </div>
                {!notif.isRead && (
                  <div className="notification-unread-indicator">
                    <FaCheck className="mark-read-icon" />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
