import React, { useState, useEffect, useRef } from 'react';
import { FaBell, FaPlus, FaEllipsisV, FaCalendarAlt, FaTimes, FaUpload, FaTrash } from 'react-icons/fa';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import Notifications from './Notifications';
import LoadingSpinner from './LoadingSpinner';
import '../styles/BulletinBoard.css';

const BulletinBoard = ({ department }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [showImportantDateModal, setShowImportantDateModal] = useState(false);
  const [modalTab, setModalTab] = useState('announcements'); // 'announcements' or 'importantDates'
  
  // Announcement form state
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementBody, setAnnouncementBody] = useState('');
  const [announcementPhoto, setAnnouncementPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  
  // Important Date form state
  const [dateTitle, setDateTitle] = useState('');
  const [dateMonth, setDateMonth] = useState('');
  const [dateDay, setDateDay] = useState('');
  
  const [announcements, setAnnouncements] = useState([]);
  const [importantDates, setImportantDates] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadAnnouncements();
    loadImportantDates();
    
    // Listen for unread notifications
    const staffData = JSON.parse(localStorage.getItem('staffData'));
    if (staffData?.uid) {
      const q = query(
        collection(db, 'notifications'),
        where('recipientId', '==', staffData.uid),
        where('recipientType', '==', 'staff')
      );

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const unread = querySnapshot.docs.filter(doc => !doc.data().isRead).length;
        setUnreadCount(unread);
      });

      return () => unsubscribe();
    }
  }, [department]);
  
  const loadAnnouncements = async () => {
    try {
      // Load all announcements (not department-specific for student viewing)
      const q = query(
        collection(db, 'announcements'),
        orderBy('createdAt', 'desc')
      );
      
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const announcementsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setAnnouncements(announcementsData);
      });
      
      return unsubscribe;
    } catch (error) {
      console.error('❌ Error loading announcements:', error);
    }
  };
  
  const loadImportantDates = async () => {
    try {
      // Load important dates for THIS department only
      const q = query(
        collection(db, 'importantDates'),
        where('office', '==', department),
        orderBy('dateValue', 'asc')
      );
      
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const datesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setImportantDates(datesData);
      });
      
      return unsubscribe;
    } catch (error) {
      console.error('❌ Error loading important dates:', error);
    }
  };
  
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      
      setAnnouncementPhoto(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleRemovePhoto = () => {
    setAnnouncementPhoto(null);
    setPhotoPreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleCreateAnnouncement = async () => {
    if (!announcementTitle.trim()) {
      alert('Please enter an announcement title');
      return;
    }
    
    if (!announcementBody.trim()) {
      alert('Please enter announcement content');
      return;
    }
    
    if (announcementTitle.length > 30) {
      alert('Title must be 30 characters or less');
      return;
    }
    
    try {
      setLoading(true);
      const staffData = JSON.parse(localStorage.getItem('staffData'));
      
      let photoBase64 = null;
      if (announcementPhoto) {
        photoBase64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(announcementPhoto);
        });
      }
      
      await addDoc(collection(db, 'announcements'), {
        department: department,
        title: announcementTitle.trim(),
        body: announcementBody.trim(),
        photo: photoBase64,
        createdBy: staffData.name,
        createdAt: serverTimestamp()
      });
      
      alert('Announcement created successfully!');
      setShowAnnouncementModal(false);
      resetAnnouncementForm();
    } catch (error) {
      console.error('❌ Error creating announcement:', error);
      alert('Failed to create announcement');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCreateImportantDate = async () => {
    if (!dateTitle.trim()) {
      alert('Please enter a title');
      return;
    }
    
    if (!dateMonth || !dateDay) {
      alert('Please select both month and day');
      return;
    }
    
    try {
      setLoading(true);
      const staffData = JSON.parse(localStorage.getItem('staffData'));
      
      // Create a sortable date value (MMDD format)
      const monthNum = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'].indexOf(dateMonth) + 1;
      const dateValue = parseInt(`${monthNum.toString().padStart(2, '0')}${dateDay.padStart(2, '0')}`);
      
      await addDoc(collection(db, 'importantDates'), {
        office: department,
        title: dateTitle.trim(),
        month: dateMonth,
        day: dateDay,
        dateValue: dateValue, // For sorting
        createdBy: staffData.name,
        createdAt: serverTimestamp()
      });
      
      alert('Important date added successfully!');
      setShowImportantDateModal(false);
      resetImportantDateForm();
    } catch (error) {
      console.error('❌ Error creating important date:', error);
      alert('Failed to create important date');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteAnnouncement = async (announcementId) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) {
      return;
    }
    
    try {
      await deleteDoc(doc(db, 'announcements', announcementId));
      alert('Announcement deleted successfully');
    } catch (error) {
      console.error('❌ Error deleting announcement:', error);
      alert('Failed to delete announcement');
    }
  };
  
  const handleDeleteImportantDate = async (dateId) => {
    if (!window.confirm('Are you sure you want to delete this important date?')) {
      return;
    }
    
    try {
      await deleteDoc(doc(db, 'importantDates', dateId));
      alert('Important date deleted successfully');
    } catch (error) {
      console.error('❌ Error deleting important date:', error);
      alert('Failed to delete important date');
    }
  };
  
  const resetAnnouncementForm = () => {
    setAnnouncementTitle('');
    setAnnouncementBody('');
    setAnnouncementPhoto(null);
    setPhotoPreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const resetImportantDateForm = () => {
    setDateTitle('');
    setDateMonth('');
    setDateDay('');
  };
  
  const openCreateModal = () => {
    setModalTab('announcements');
    setShowAnnouncementModal(true);
  };
  return (
    <div className="bulletin-board-container">
      <div className="bulletin-header">
        <h1 className="bulletin-title">Bulletin Board</h1>
        <div className="bulletin-header-actions">
          <button className="create-announcement-btn" onClick={openCreateModal}>
            <FaPlus />
            Create new announcement
          </button>
          <div className="notification-bell" onClick={() => setShowNotifications(true)}>
            <FaBell className="bell-icon" />
            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
          </div>
        </div>
      </div>

      <div className="hero-banner">
        <div className="hero-overlay">
          <h2 className="hero-title">FINAL LISTING FOR 2026 GRADUATION</h2>
          <p className="hero-subtitle">
            Ensure all academic record is clear and all departments requirements are met by March 25.
          </p>
        </div>
      </div>

      <div className="bulletin-content-grid">
        <div className="announcements-section">
          <h3 className="section-title">Announcements</h3>
          
          {announcements.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#999', padding: '40px' }}>No announcements yet</p>
          ) : (
            announcements.map((announcement) => (
              <div key={announcement.id} className="announcement-card">
                {announcement.photo && (
                  <div className="announcement-image">
                    <img src={announcement.photo} alt={announcement.title} className="announcement-photo" />
                  </div>
                )}
                <div className="announcement-content">
                  <div className="announcement-header-row">
                    <span className="announcement-department">{announcement.department}</span>
                    <FaEllipsisV 
                      className="announcement-menu-icon" 
                      onClick={() => handleDeleteAnnouncement(announcement.id)}
                      title="Delete announcement"
                    />
                  </div>
                  <h4 className="announcement-title">{announcement.title}</h4>
                  <p className="announcement-description">{announcement.body}</p>
                  <p className="announcement-author">By {announcement.createdBy}</p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="deadlines-section">
          <div className="deadlines-header">
            <FaCalendarAlt className="calendar-icon" />
            <h3 className="deadlines-title">Important Deadlines</h3>
            <button 
              className="add-deadline-btn" 
              onClick={() => setShowImportantDateModal(true)}
              title="Add important date"
            >
              <FaPlus />
            </button>
          </div>
          
          <div className="deadlines-list">
            {importantDates.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#999', padding: '20px', fontSize: '14px' }}>
                No important dates yet
              </p>
            ) : (
              importantDates.map((deadline) => (
                <div key={deadline.id} className="deadline-item">
                  <div className="deadline-date">
                    <span className="deadline-month">{deadline.month}</span>
                    <span className="deadline-day">{deadline.day}</span>
                  </div>
                  <div className="deadline-info">
                    <p className="deadline-title">{deadline.title}</p>
                    <p className="deadline-office">{deadline.office}</p>
                  </div>
                  <FaTrash 
                    className="delete-deadline-icon" 
                    onClick={() => handleDeleteImportantDate(deadline.id)}
                    title="Delete deadline"
                  />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      
      {/* Announcement Modal */}
      {showAnnouncementModal && (
        <div className="modal-overlay" onClick={() => setShowAnnouncementModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-sidebar">
              <button 
                className={`modal-tab ${modalTab === 'announcements' ? 'active' : ''}`}
                onClick={() => setModalTab('announcements')}
              >
                Announcements
              </button>
              <button 
                className={`modal-tab ${modalTab === 'importantDates' ? 'active' : ''}`}
                onClick={() => setModalTab('importantDates')}
              >
                Important Dates
              </button>
            </div>
            
            <div className="modal-main">
              <button className="modal-close-btn" onClick={() => setShowAnnouncementModal(false)}>
                <FaTimes />
              </button>
              
              {modalTab === 'announcements' ? (
                <div className="announcement-form">
                  <h3 className="modal-title">Create Announcement</h3>
                  
                  <div className="form-group">
                    <label>Announcement Title</label>
                    <input
                      type="text"
                      placeholder="Max. of 30 characters"
                      value={announcementTitle}
                      onChange={(e) => setAnnouncementTitle(e.target.value)}
                      maxLength={30}
                      className="form-input"
                    />
                    <span className="char-count">{announcementTitle.length}/30</span>
                  </div>
                  
                  <div className="form-group">
                    <label>Announcement Body</label>
                    <textarea
                      placeholder="Type your announcement content here...."
                      value={announcementBody}
                      onChange={(e) => setAnnouncementBody(e.target.value)}
                      rows={6}
                      className="form-textarea"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Attach Photo (Optional)</label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      style={{ display: 'none' }}
                    />
                    
                    {photoPreview ? (
                      <div className="photo-preview-container">
                        <img src={photoPreview} alt="Preview" className="photo-preview" />
                        <button className="remove-photo-btn" onClick={handleRemovePhoto}>
                          <FaTrash /> Remove
                        </button>
                      </div>
                    ) : (
                      <div className="file-upload-area" onClick={() => fileInputRef.current?.click()}>
                        <FaUpload className="upload-icon" />
                        <p>Click to upload or drag and drop</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="modal-actions">
                    <button className="cancel-btn" onClick={() => setShowAnnouncementModal(false)}>
                      Cancel
                    </button>
                    <button 
                      className="confirm-btn" 
                      onClick={handleCreateAnnouncement}
                      disabled={loading}
                    >
                      {loading && <span className="btn-spinner"></span>}
                      {loading ? 'Creating...' : 'Confirm'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="important-date-form">
                  <h3 className="modal-title">Add Important Date</h3>
                  
                  <div className="form-group">
                    <label>Title</label>
                    <input
                      type="text"
                      placeholder="e.g., Graduation Fee Payment"
                      value={dateTitle}
                      onChange={(e) => setDateTitle(e.target.value)}
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Month</label>
                      <select 
                        value={dateMonth} 
                        onChange={(e) => setDateMonth(e.target.value)}
                        className="form-select"
                      >
                        <option value="">Select month</option>
                        {['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'].map(month => (
                          <option key={month} value={month}>{month}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label>Day</label>
                      <input
                        type="number"
                        min="1"
                        max="31"
                        placeholder="Day"
                        value={dateDay}
                        onChange={(e) => setDateDay(e.target.value)}
                        className="form-input"
                      />
                    </div>
                  </div>
                  
                  <div className="modal-actions">
                    <button className="cancel-btn" onClick={() => setShowAnnouncementModal(false)}>
                      Cancel
                    </button>
                    <button 
                      className="confirm-btn" 
                      onClick={handleCreateImportantDate}
                      disabled={loading}
                    >
                      {loading && <span className="btn-spinner"></span>}
                      {loading ? 'Adding...' : 'Confirm'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Important Date Modal */}
      {showImportantDateModal && (
        <div className="modal-overlay" onClick={() => setShowImportantDateModal(false)}>
          <div className="modal-content-small" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowImportantDateModal(false)}>
              <FaTimes />
            </button>
            
            <h3 className="modal-title">Add Important Date</h3>
            
            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                placeholder="e.g., Graduation Fee Payment"
                value={dateTitle}
                onChange={(e) => setDateTitle(e.target.value)}
                className="form-input"
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Month</label>
                <select 
                  value={dateMonth} 
                  onChange={(e) => setDateMonth(e.target.value)}
                  className="form-select"
                >
                  <option value="">Select month</option>
                  {['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'].map(month => (
                    <option key={month} value={month}>{month}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Day</label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  placeholder="Day"
                  value={dateDay}
                  onChange={(e) => setDateDay(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>
            
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowImportantDateModal(false)}>
                Cancel
              </button>
              <button 
                className="confirm-btn" 
                onClick={handleCreateImportantDate}
                disabled={loading}
              >
                {loading && <span className="btn-spinner"></span>}
                {loading ? 'Adding...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {loading && <LoadingSpinner message="Processing..." fullScreen={true} />}
      
      <Notifications isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
    </div>
  );
};

export default BulletinBoard;
