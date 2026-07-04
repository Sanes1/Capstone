import React, { useState } from 'react';
import { MdNotifications, MdDownload, MdAttachFile, MdCheckCircle } from 'react-icons/md';
import { FaUserCircle } from 'react-icons/fa';
import '../styles/RequestDetails.css';

function RequestDetails({ onNavigate }) {
  const [comment, setComment] = useState('');

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
        <div className="header-actions">
          <button className="notification-btn">
            <MdNotifications />
          </button>
        </div>
      </div>

      <div className="details-container">
        <div className="main-content-area">
          <div className="request-card">
            <div className="request-header">
              <div className="request-title">
                <h2>FINANCIAL INQUIRY: TUITION PAYMENT</h2>
                <p className="request-id">#FIN-123-654-789</p>
              </div>
              <div className="request-actions">
                <span className="status-badge pending">Pending</span>
                <button className="cancel-btn">Cancel Request</button>
              </div>
            </div>

            <div className="original-submission">
              <div className="section-header">
                <h3>Original Submission</h3>
                <span className="created-date">Created on February 16, 2026</span>
              </div>
              <p className="submission-text">
                "Good day! I would like to request assistance regarding my tuition payment issue. 
                May I ask for your help in checking and clarifying my balance/records? Thank you so much."
              </p>
              <div className="attachments">
                <button className="attachment-btn">
                  <MdDownload /> ORP.pdf
                </button>
                <button className="attachment-btn">
                  <MdDownload /> ID_Proof.pdf
                </button>
              </div>
            </div>
          </div>

          <div className="comment-section">
            <div className="comment-header">
              <FaUserCircle className="user-icon" />
              <div>
                <h4>Add follow-up comment</h4>
                <span className="comment-limit">(Only up to 3 follow-up comments)</span>
              </div>
            </div>
            <textarea 
              placeholder="Type your message here..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <div className="comment-footer">
              <button className="attach-btn">
                <MdAttachFile /> Attach documents (Max 5MB)
              </button>
              <button className="send-btn">Send Message</button>
            </div>
          </div>
        </div>

        <aside className="sidebar-details">
          <div className="details-card">
            <h3>Request Details</h3>
            <div className="detail-row">
              <span className="label">REQUEST ID</span>
              <span className="value">#FIN-123-654-789</span>
            </div>
            <div className="detail-row">
              <span className="label">OFFICE CODE</span>
              <span className="value">FIN-001</span>
            </div>
            <div className="detail-row">
              <span className="label">DATE OF CREATION</span>
              <span className="value">FEB 16, 2026</span>
            </div>
            <div className="detail-row">
              <span className="label">ESTIMATED COMPLETION</span>
              <span className="value">FEB 18, 2026</span>
            </div>
          </div>

          <div className="timeline-card">
            <h3>Status Timeline</h3>
            <div className="timeline">
              <div className="timeline-item completed">
                <div className="timeline-icon">
                  <MdCheckCircle />
                </div>
                <div className="timeline-content">
                  <h4>SUBMITTED</h4>
                  <p className="timeline-date">February 16, 2026</p>
                  <p className="timeline-desc">Initial Student Request</p>
                </div>
              </div>
              <div className="timeline-item active">
                <div className="timeline-icon">
                  <MdCheckCircle />
                </div>
                <div className="timeline-content">
                  <h4>PROCESSING</h4>
                  <p className="timeline-date">February 17, 2026</p>
                  <p className="timeline-desc">Being Processed by Alex Smith</p>
                </div>
              </div>
              <div className="timeline-item">
                <div className="timeline-icon">
                  <MdCheckCircle />
                </div>
                <div className="timeline-content">
                  <h4>RESOLVED</h4>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default RequestDetails;
