import React, { useState, useEffect, useRef } from 'react';
import { FaBell, FaUndo, FaCheck, FaFileAlt, FaDownload, FaUserCircle, FaEnvelope, FaCheckCircle, FaTimes } from 'react-icons/fa';
import { doc, getDoc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import '../styles/TicketDetails.css';

const TicketDetails = ({ ticketData, department, onNavigate }) => {
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replyMessage, setReplyMessage] = useState('');
  const [replyFiles, setReplyFiles] = useState([]);
  const [sending, setSending] = useState(false);
  const [reassignOffice, setReassignOffice] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (ticketData) {
      loadTicketDetails();
    }
  }, [ticketData]);

  const loadTicketDetails = async () => {
    try {
      setLoading(true);
      
      const docRef = doc(db, 'requests', ticketData.firestoreId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        setTicket({
          ...data,
          firestoreId: docSnap.id
        });
        setReassignOffice(data.office || '');
        console.log('✅ Loaded ticket details:', data);
      } else {
        console.error('❌ Ticket not found');
        alert('Ticket not found');
      }
    } catch (error) {
      console.error('❌ Error loading ticket:', error);
      alert('Failed to load ticket details');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => file.size <= 5 * 1024 * 1024);
    
    if (validFiles.length < files.length) {
      alert('Some files exceed 5MB and were not added');
    }
    
    setReplyFiles(prev => [...prev, ...validFiles]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveFile = (index) => {
    setReplyFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSendReply = async () => {
    if (!replyMessage.trim() && replyFiles.length === 0) {
      alert('Please add a message or attach files');
      return;
    }

    try {
      setSending(true);
      
      // Convert files to base64
      const attachments = [];
      for (let file of replyFiles) {
        const base64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        
        attachments.push({
          name: file.name,
          data: base64,
          size: file.size,
          type: file.type,
          uploadedAt: new Date().toISOString()
        });
      }

      const staffData = JSON.parse(localStorage.getItem('staffData'));
      
      // Add follow-up to Firestore
      const docRef = doc(db, 'requests', ticket.firestoreId);
      await updateDoc(docRef, {
        followUps: arrayUnion({
          message: replyMessage.trim(),
          attachments: attachments,
          sentBy: 'staff',
          sentByName: staffData.name,
          sentAt: new Date().toISOString(),
          timestamp: serverTimestamp()
        }),
        updatedAt: serverTimestamp()
      });

      alert('Reply sent successfully!');
      setReplyMessage('');
      setReplyFiles([]);
      loadTicketDetails();
      
    } catch (error) {
      console.error('❌ Error sending reply:', error);
      alert('Failed to send reply: ' + error.message);
    } finally {
      setSending(false);
    }
  };

  const handleReturnTicket = async () => {
    const reason = prompt('Please provide a reason for returning this ticket:');
    if (!reason) return;

    try {
      const docRef = doc(db, 'requests', ticket.firestoreId);
      await updateDoc(docRef, {
        status: 'Returned',
        returnedAt: serverTimestamp(),
        returnedReason: reason,
        updatedAt: serverTimestamp()
      });
      
      alert('Ticket returned successfully');
      onNavigate('my-tickets');
    } catch (error) {
      console.error('❌ Error returning ticket:', error);
      alert('Failed to return ticket');
    }
  };

  const handleResolveTicket = async () => {
    if (!window.confirm('Are you sure you want to resolve this ticket?')) {
      return;
    }

    try {
      const docRef = doc(db, 'requests', ticket.firestoreId);
      await updateDoc(docRef, {
        status: 'Resolved',
        resolvedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      alert('Ticket resolved successfully');
      onNavigate('my-tickets');
    } catch (error) {
      console.error('❌ Error resolving ticket:', error);
      alert('Failed to resolve ticket');
    }
  };

  const generateRequestId = (officeName) => {
    // Generate format: FIN-123-654-789
    const officePrefix = officeName.substring(0, 3).toUpperCase();
    const randomNum1 = Math.floor(100 + Math.random() * 900); // 3 digits
    const randomNum2 = Math.floor(100 + Math.random() * 900); // 3 digits
    const randomNum3 = Math.floor(100 + Math.random() * 900); // 3 digits
    return `${officePrefix}-${randomNum1}-${randomNum2}-${randomNum3}`;
  };

  const handleReassign = async () => {
    if (reassignOffice === ticket.office) {
      alert('Ticket is already assigned to this office');
      return;
    }

    if (!window.confirm(`Reassign this ticket to ${reassignOffice}?`)) {
      return;
    }

    try {
      // Generate new request ID based on new office
      const newRequestId = generateRequestId(reassignOffice);
      const staffData = JSON.parse(localStorage.getItem('staffData'));
      
      const docRef = doc(db, 'requests', ticket.firestoreId);
      await updateDoc(docRef, {
        office: reassignOffice,
        requestId: newRequestId, // Update request ID to match new office
        officeId: reassignOffice.toLowerCase(),
        assignedTo: null, // Clear assigned staff
        claimedBy: null,
        claimedAt: null,
        status: 'Pending', // Reset to pending
        reassignedFrom: ticket.office, // Track original office
        reassignedBy: staffData.name, // Track who reassigned it
        reassignedAt: serverTimestamp(),
        previousRequestId: ticket.requestId, // Keep old request ID for reference
        updatedAt: serverTimestamp()
      });
      
      alert(`Ticket reassigned successfully!\nNew Request ID: ${newRequestId}`);
      onNavigate('my-tickets');
    } catch (error) {
      console.error('❌ Error reassigning ticket:', error);
      alert('Failed to reassign ticket');
    }
  };

  const downloadAttachment = (attachment) => {
    const link = document.createElement('a');
    link.href = attachment.data;
    link.download = attachment.name;
    link.click();
  };

  const getTimeAgo = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const maskEmail = (email) => {
    if (!email) return '';
    const [username, domain] = email.split('@');
    if (username.length <= 3) return email;
    return `${username.substring(0, 2)}.*****${username.substring(username.length - 2)}@${domain}`;
  };

  const handleBackToTickets = () => {
    onNavigate('my-tickets');
  };

  if (loading || !ticket) {
    return (
      <div className="ticket-details-container">
        <div className="breadcrumb">
          <span className="breadcrumb-item clickable" onClick={handleBackToTickets}>
            All Ticket
          </span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-item">Ticket Details</span>
        </div>
        <div className="page-header">
          <h1 className="page-title">Ticket Details</h1>
        </div>
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <p>Loading ticket details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ticket-details-container">
      <div className="breadcrumb">
        <span className="breadcrumb-item clickable" onClick={handleBackToTickets}>
          All Ticket
        </span>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-item">Ticket Details</span>
      </div>

      <div className="page-header">
        <h1 className="page-title">Ticket Details</h1>
        <FaBell className="notification-bell" />
      </div>

      <div className="ticket-details-content">
        <div className="main-ticket-section">
          <div className="ticket-card">
            <div className="ticket-card-header">
              <div className="ticket-title-section">
                <h2>{ticket.subject?.toUpperCase()}</h2>
                <p className="ticket-number-display">#{ticket.requestId}</p>
              </div>
              <span className="ticket-status-badge">{ticket.status}</span>
            </div>
            
            <div className="ticket-action-buttons">
              {ticket.status !== 'Resolved' && ticket.status !== 'Cancelled' && (
                <>
                  <button className="return-btn" onClick={handleReturnTicket}>
                    <FaUndo />
                    Return Ticket
                  </button>
                  <button className="resolve-btn" onClick={handleResolveTicket}>
                    <FaCheck />
                    Resolve Ticket
                  </button>
                </>
              )}
            </div>
            
            <p className="submitted-time">Submitted {getTimeAgo(ticket.createdAt)}</p>
          </div>

          <div className="submission-section">
            <div className="section-header-row">
              <h3 className="section-title">Original Submission</h3>
              <span className="created-date">Created on {formatDate(ticket.createdAt)}</span>
            </div>
            
            <div className="submission-message">
              "{ticket.description}"
            </div>
            
            {ticket.attachments && ticket.attachments.length > 0 && (
              <div className="attachments">
                {ticket.attachments.map((file, index) => (
                  <div key={index} className="attachment-file" onClick={() => downloadAttachment(file)}>
                    <FaFileAlt className="file-icon" />
                    <span className="file-name">{file.name}</span>
                    <FaDownload className="download-icon" />
                  </div>
                ))}
              </div>
            )}

            {/* Display follow-ups */}
            {ticket.followUps && ticket.followUps.map((followUp, index) => (
              <div key={index} className={`followup-message ${followUp.sentBy === 'staff' ? 'staff-message' : 'student-message'}`}>
                <div className="followup-header">
                  <FaUserCircle className="followup-avatar" />
                  <div>
                    <span className="followup-sender">{followUp.sentBy === 'staff' ? followUp.sentByName : ticket.studentName}</span>
                    <span className="followup-date">{formatDate(followUp.sentAt)}</span>
                  </div>
                </div>
                <p className="followup-text">{followUp.message}</p>
                {followUp.attachments && followUp.attachments.length > 0 && (
                  <div className="attachments">
                    {followUp.attachments.map((file, idx) => (
                      <div key={idx} className="attachment-file" onClick={() => downloadAttachment(file)}>
                        <FaFileAlt className="file-icon" />
                        <span className="file-name">{file.name}</span>
                        <FaDownload className="download-icon" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            
            {ticket.status !== 'Resolved' && ticket.status !== 'Cancelled' && (
              <div className="reply-section">
                <div className="reply-header">
                  <FaUserCircle className="reply-avatar" />
                  <span className="reply-label">Reply to student</span>
                </div>
                
                <textarea 
                  className="reply-textarea"
                  placeholder="Type your message here..."
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  disabled={sending}
                />
                
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                  accept="image/*,.pdf,.doc,.docx,.txt"
                />
                
                {replyFiles.length > 0 && (
                  <div className="uploaded-files-list">
                    {replyFiles.map((file, index) => (
                      <div key={index} className="uploaded-file-item">
                        <span className="file-name">{file.name}</span>
                        <button onClick={() => handleRemoveFile(index)} className="remove-file-btn">
                          <FaTimes />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="reply-actions">
                  <button 
                    className="request-info-btn"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={sending}
                  >
                    Attach Files
                  </button>
                  <button 
                    className="send-message-btn"
                    onClick={handleSendReply}
                    disabled={sending}
                  >
                    {sending ? 'Sending...' : 'Send Message'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="sidebar-section">
          <div className="status-timeline-card">
            <h3 className="timeline-title">Status Timeline</h3>
            
            <div className="timeline-item">
              <div className="timeline-icon complete">
                <FaCheckCircle />
              </div>
              <div className="timeline-info">
                <p className="timeline-status">SUBMITTED</p>
                <p className="timeline-date">{formatDate(ticket.createdAt)}</p>
                <p className="timeline-description">Initial Student Request</p>
              </div>
            </div>
            
            <div className="timeline-item">
              <div className={`timeline-icon ${ticket.claimedBy ? 'complete' : 'incomplete'}`}>
                {ticket.claimedBy ? <FaCheckCircle /> : <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'white' }}></div>}
              </div>
              <div className="timeline-info">
                <p className="timeline-status">PROCESSING</p>
                {ticket.claimedAt && <p className="timeline-date">{formatDate(ticket.claimedAt)}</p>}
                {ticket.claimedBy && <p className="timeline-description">Accepted and processed by {ticket.claimedBy}</p>}
              </div>
            </div>
            
            <div className="timeline-item">
              <div className={`timeline-icon ${ticket.status === 'Resolved' ? 'complete' : 'incomplete'}`}>
                {ticket.status === 'Resolved' ? <FaCheckCircle /> : <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'white' }}></div>}
              </div>
              <div className="timeline-info">
                <p className="timeline-status">RESOLVED/REJECTED</p>
                {ticket.resolvedAt && <p className="timeline-date">{formatDate(ticket.resolvedAt)}</p>}
              </div>
            </div>
          </div>

          <div className="management-card">
            <h3 className="management-title">Management Control</h3>
            
            <div className="management-field">
              <p className="field-label">URGENCY LEVEL</p>
              <p className="field-value">Normal - Process within 2-3 days</p>
            </div>
            
            <div className="management-field">
              <p className="field-label">REASSIGN TO</p>
              <select 
                className="field-select"
                value={reassignOffice}
                onChange={(e) => setReassignOffice(e.target.value)}
              >
                <option value="Finance">Finance Office</option>
                <option value="Registrar">Registrar's Office</option>
                <option value="Library">Library</option>
                <option value="Guidance">Guidance Office</option>
              </select>
              {reassignOffice !== ticket.office && (
                <button className="reassign-btn" onClick={handleReassign}>
                  Reassign Ticket
                </button>
              )}
            </div>
          </div>

          <div className="student-info-card">
            <div className="student-avatar">
              {ticket.studentProfilePicture ? (
                <img src={ticket.studentProfilePicture} alt="Student" className="student-avatar-img" />
              ) : (
                <FaUserCircle className="student-avatar-icon" />
              )}
            </div>
            <h4 className="student-name">{ticket.studentName}</h4>
            <p className="student-school">Junior High School</p>
            
            <div className="student-details">
              <div className="student-detail-row">{ticket.studentId || 'N/A'}</div>
              <div className="student-detail-row">{ticket.studentGradeLevel || 'Grade N/A'} - {ticket.studentSection || 'Section N/A'}</div>
              <div className="student-detail-row">{maskEmail(ticket.studentEmail)}</div>
            </div>
            
            <button className="contact-student-btn">
              <FaEnvelope />
              CONTACT STUDENT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetails;
