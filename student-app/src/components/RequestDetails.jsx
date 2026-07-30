import React, { useState, useEffect, useRef } from 'react';
import { MdDownload, MdAttachFile, MdCheckCircle, MdClose } from 'react-icons/md';
import { FaUserCircle } from 'react-icons/fa';
import { doc, getDoc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { notifyStaffFollowUp } from '../utils/notificationHelper';
import '../styles/RequestDetails.css';

function RequestDetails({ requestData, onNavigate }) {
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [followUpFiles, setFollowUpFiles] = useState([]);
  const [sending, setSending] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (requestData) {
      loadRequestDetails();
    }
  }, [requestData]);

  const loadRequestDetails = async () => {
    try {
      setLoading(true);
      
      // Get fresh data from Firestore
      const docRef = doc(db, 'requests', requestData.firestoreId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        setRequest({
          ...data,
          firestoreId: docSnap.id,
          date: data.createdAt?.toDate().toLocaleDateString('en-US', { 
            month: 'long', 
            day: 'numeric', 
            year: 'numeric' 
          }) || 'N/A',
          createdAtTimestamp: data.createdAt?.toDate().getTime() || 0
        });
        console.log('✅ Loaded request details:', data);
      } else {
        console.error('❌ Request not found');
        alert('Request not found');
      }
    } catch (error) {
      console.error('❌ Error loading request:', error);
      alert('Failed to load request details');
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
    
    setFollowUpFiles(prev => [...prev, ...validFiles]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveFile = (index) => {
    setFollowUpFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSendFollowUp = async () => {
    if (!comment.trim() && followUpFiles.length === 0) {
      alert('Please add a comment or attach files');
      return;
    }

    // Check follow-up limit
    const followUps = request.followUps || [];
    if (followUps.length >= 3) {
      alert('Maximum 3 follow-up comments allowed');
      return;
    }

    try {
      setSending(true);
      
      // Convert files to base64
      const attachments = [];
      for (let file of followUpFiles) {
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

      const studentData = JSON.parse(localStorage.getItem('studentData'));
      
      // Add follow-up to Firestore
      const docRef = doc(db, 'requests', request.firestoreId);
      await updateDoc(docRef, {
        followUps: arrayUnion({
          message: comment.trim(),
          attachments: attachments,
          sentBy: 'student',
          sentByName: studentData.name || `${studentData.firstName} ${studentData.lastName}`.trim(),
          sentAt: new Date().toISOString(),
          timestamp: serverTimestamp()
        }),
        updatedAt: serverTimestamp()
      });

      // Notify assigned staff member if ticket is assigned
      if (request.assignedTo || request.claimedBy) {
        await notifyStaffFollowUp(
          request.assignedTo || request.claimedBy,
          request.requestId,
          request.subject,
          studentData.name || `${studentData.firstName} ${studentData.lastName}`.trim(),
          request.office
        );
      }

      alert('Follow-up sent successfully!');
      setComment('');
      setFollowUpFiles([]);
      loadRequestDetails(); // Reload to show new follow-up
      
    } catch (error) {
      console.error('❌ Error sending follow-up:', error);
      alert('Failed to send follow-up: ' + error.message);
    } finally {
      setSending(false);
    }
  };

  const handleCancelRequest = async () => {
    if (!window.confirm('Are you sure you want to cancel this request?')) {
      return;
    }

    try {
      const docRef = doc(db, 'requests', request.firestoreId);
      await updateDoc(docRef, {
        status: 'Cancelled',
        updatedAt: serverTimestamp()
      });
      
      alert('Request cancelled successfully');
      onNavigate('request');
    } catch (error) {
      console.error('❌ Error cancelling request:', error);
      alert('Failed to cancel request');
    }
  };

  const downloadAttachment = (attachment) => {
    const link = document.createElement('a');
    link.href = attachment.data;
    link.download = attachment.name;
    link.click();
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'pending';
      case 'in process': return 'in-process';
      case 'resolved': return 'resolved';
      case 'cancelled': return 'cancelled';
      case 'returned': return 'returned';
      case 'for follow up': return 'for-follow-up';
      default: return 'pending';
    }
  };

  const getOfficeCode = (office) => {
    const codes = {
      'Finance': 'FIN-001',
      'Library': 'LIB-001',
      'Registrar': 'REG-001',
      'Guidance': 'GUI-001'
    };
    return codes[office] || 'N/A';
  };

  const getEstimatedCompletion = (createdDate) => {
    if (!createdDate) return 'N/A';
    const date = new Date(createdDate);
    date.setDate(date.getDate() + 2); // Add 2 days
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const renderTimeline = () => {
    if (!request) return null;

    const status = request.status?.toLowerCase();
    
    // Format claimedAt date if it exists
    let processingDate = 'Pending';
    let processingDescription = 'Waiting for staff to process';
    
    if (request.claimedAt && request.claimedBy) {
      // claimedAt is a Firestore Timestamp, convert it
      if (request.claimedAt?.toDate) {
        processingDate = request.claimedAt.toDate().toLocaleDateString('en-US', { 
          month: 'long', 
          day: 'numeric', 
          year: 'numeric' 
        });
      } else if (typeof request.claimedAt === 'string') {
        // If it's already a string, use it directly
        processingDate = request.claimedAt;
      }
      processingDescription = `Being Processed by ${request.claimedBy}`;
    } else if (status === 'in process' || status === 'resolved') {
      processingDate = 'In Progress';
      processingDescription = 'Being processed by staff';
    }
    
    // Build timeline items based on status
    const timelineItems = [
      {
        status: 'SUBMITTED',
        completed: true,
        date: request.date,
        description: 'Initial Student Request'
      },
      {
        status: 'PROCESSING',
        completed: status === 'in process' || status === 'resolved' || status === 'returned' || status === 'for follow up',
        active: status === 'in process',
        date: processingDate,
        description: processingDescription
      }
    ];

    // Add "RETURNED/FOR FOLLOW UP" only if status is 'returned' or 'for follow up'
    if (status === 'returned' || status === 'for follow up') {
      timelineItems.push({
        status: 'RETURNED/FOR FOLLOW UP',
        completed: true,
        active: true,
        date: request.returnedAt?.toDate?.()?.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        description: request.returnedReason || 'Additional documents required'
      });
    }

    timelineItems.push({
      status: 'RESOLVED',
      completed: status === 'resolved',
      active: status === 'resolved',
      date: status === 'resolved' ? (request.resolvedAt?.toDate?.()?.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) || '') : '',
      description: status === 'resolved' ? 'Request completed' : ''
    });

    return timelineItems.map((item, index) => (
      <div key={index} className={`timeline-item ${item.completed ? 'completed' : ''} ${item.active ? 'active' : ''}`}>
        <div className="timeline-icon">
          <MdCheckCircle />
        </div>
        <div className="timeline-content">
          <h4>{item.status}</h4>
          {item.date && <p className="timeline-date">{item.date}</p>}
          {item.description && <p className="timeline-desc">{item.description}</p>}
        </div>
      </div>
    ));
  };

  if (loading || !request) {
    return (
      <div className="request-details-page">
        <div className="breadcrumb">
          <span className="clickable" onClick={() => onNavigate('request')}>Request History</span>
          <span className="separator">/</span>
          <span className="active">Request Details</span>
          <span className="separator">/</span>
          <span className="clickable" onClick={() => onNavigate('new-request')}>New Request</span>
        </div>
        <div className="page-header">
          <h1>Request Details</h1>
        </div>
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <p>Loading request details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="request-details-page">
      <div className="breadcrumb">
        <span className="clickable" onClick={() => onNavigate('request')}>Request History</span>
        <span className="separator">/</span>
        <span className="active">Request Details</span>
        <span className="separator">/</span>
        <span className="clickable" onClick={() => onNavigate('new-request')}>New Request</span>
      </div>

      <div className="page-header">
        <h1>Request Details</h1>
      </div>

      <div className="details-container">
        <div className="main-content-area">
          <div className="request-card">
            <div className="request-header">
              <div className="request-title">
                <h2>{request.subject?.toUpperCase()}</h2>
                <p className="request-id">#{request.requestId}</p>
              </div>
              <div className="request-actions">
                <span className={`status-badge ${getStatusBadgeClass(request.status)}`}>
                  {request.status}
                </span>
                {request.status?.toLowerCase() === 'pending' && (
                  <button className="cancel-btn" onClick={handleCancelRequest}>Cancel Request</button>
                )}
              </div>
            </div>

            <div className="original-submission">
              <div className="section-header">
                <h3>Original Submission</h3>
                <span className="created-date">Created on {request.date}</span>
              </div>
              <p className="submission-text">"{request.description}"</p>
              
              {request.attachments && request.attachments.length > 0 && (
                <div className="attachments">
                  {request.attachments.map((file, index) => (
                    <button 
                      key={index} 
                      className="attachment-btn"
                      onClick={() => downloadAttachment(file)}
                    >
                      <MdDownload /> {file.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Display staff responses */}
            {request.followUps && request.followUps.filter(f => f.sentBy === 'staff').map((followUp, index) => (
              <div key={index} className="staff-response">
                <div className="response-header">
                  <FaUserCircle className="staff-icon" />
                  <div>
                    <h4>{request.office} Department</h4>
                    <span className="staff-name">{followUp.sentByName}</span>
                  </div>
                  <span className="response-date">{new Date(followUp.sentAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} | {new Date(followUp.sentAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="response-text">{followUp.message}</p>
                {followUp.attachments && followUp.attachments.length > 0 && (
                  <div className="attachments">
                    {followUp.attachments.map((file, idx) => (
                      <button 
                        key={idx} 
                        className="attachment-btn"
                        onClick={() => downloadAttachment(file)}
                      >
                        <MdDownload /> {file.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Display student follow-ups */}
            {request.followUps && request.followUps.filter(f => f.sentBy === 'student').map((followUp, index) => (
              <div key={`student-${index}`} className="student-followup">
                <div className="followup-header">
                  <FaUserCircle className="user-icon" />
                  <div>
                    <h4>Your Follow-up</h4>
                    <span className="followup-date">{new Date(followUp.sentAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                </div>
                <p className="followup-text">{followUp.message}</p>
                {followUp.attachments && followUp.attachments.length > 0 && (
                  <div className="attachments">
                    {followUp.attachments.map((file, idx) => (
                      <button 
                        key={idx} 
                        className="attachment-btn"
                        onClick={() => downloadAttachment(file)}
                      >
                        <MdDownload /> {file.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Follow-up comment section */}
          {request.status?.toLowerCase() !== 'resolved' && request.status?.toLowerCase() !== 'cancelled' && (
            <div className="comment-section">
              <div className="comment-header">
                <FaUserCircle className="user-icon" />
                <div>
                  <h4>Add follow-up comment</h4>
                  <span className="comment-limit">
                    (Only up to 3 follow-up comments - {(request.followUps?.filter(f => f.sentBy === 'student') || []).length}/3 used)
                  </span>
                </div>
              </div>
              <textarea 
                placeholder="Type your message here..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
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
              
              {followUpFiles.length > 0 && (
                <div className="uploaded-files-list">
                  {followUpFiles.map((file, index) => (
                    <div key={index} className="uploaded-file-item">
                      <span className="file-name">{file.name}</span>
                      <button
                        type="button"
                        className="remove-file-btn"
                        onClick={() => handleRemoveFile(index)}
                      >
                        <MdClose />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="comment-footer">
                <button 
                  className="attach-btn"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={sending}
                >
                  <MdAttachFile /> Attach documents (Max 5MB)
                </button>
                <button 
                  className="send-btn"
                  onClick={handleSendFollowUp}
                  disabled={sending || ((request.followUps?.filter(f => f.sentBy === 'student') || []).length >= 3)}
                >
                  {sending ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            </div>
          )}
        </div>

        <aside className="sidebar-details">
          <div className="details-card">
            <h3>Request Details</h3>
            <div className="detail-row">
              <span className="label">REQUEST ID</span>
              <span className="value">#{request.requestId}</span>
            </div>
            <div className="detail-row">
              <span className="label">OFFICE CODE</span>
              <span className="value">{getOfficeCode(request.office)}</span>
            </div>
            <div className="detail-row">
              <span className="label">DATE OF CREATION</span>
              <span className="value">{new Date(request.createdAt?.toDate()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}</span>
            </div>
            <div className="detail-row">
              <span className="label">ESTIMATED COMPLETION</span>
              <span className="value">{getEstimatedCompletion(request.createdAt?.toDate()).toUpperCase()}</span>
            </div>
          </div>

          <div className="timeline-card">
            <h3>Status Timeline</h3>
            <div className="timeline">
              {renderTimeline()}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default RequestDetails;
