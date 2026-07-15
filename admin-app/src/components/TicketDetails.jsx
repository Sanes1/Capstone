import React from 'react';
import { 
  FaBell, 
  FaUndo, 
  FaCheckCircle, 
  FaFile, 
  FaDownload, 
  FaUserCircle,
  FaEnvelope
} from 'react-icons/fa';
import '../styles/TicketDetails.css';

const TicketDetails = ({ department }) => {
  return (
    <div className="ticket-details-container">
      <div className="breadcrumb">
        <span className="breadcrumb-item">All Ticket</span>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-item">Ticket Details</span>
      </div>

      <div className="page-header">
        <h1 className="page-title">Ticket Details</h1>
        <div className="header-right">
          <FaBell className="notification-bell" />
        </div>
      </div>

      <div className="ticket-details-content">
        <div className="ticket-main-section">
          <div className="ticket-card">
            <div className="ticket-header-section">
              <div className="ticket-title-group">
                <h2>FINANCIAL INQUIRY: TUITION PAYMENT</h2>
                <p className="ticket-id-text">#FIN-123-654-789</p>
              </div>
              <span className="ticket-status-badge">In Progress</span>
            </div>

            <p className="ticket-submitted-time">Submitted 5 hours ago</p>

            <div className="ticket-actions">
              <button className="return-btn">
                <FaUndo />
                Return Ticket
              </button>
              <button className="resolve-btn">
                <FaCheckCircle />
                Resolve Ticket
              </button>
            </div>

            <div className="original-submission-section">
              <div className="section-header-row">
                <h3 className="section-title-text">Original Submission</h3>
                <span className="created-date">Created on February 16, 2026</span>
              </div>

              <p className="submission-message">
                "Good day! I would like to request assistance regarding my tuition payment issue. 
                May I ask for your help in checking and clarifying my balance/records? Thank you so much."
              </p>

              <div className="attachments-list">
                <div className="attachment-item">
                  <FaFile className="attachment-icon" />
                  <span className="attachment-name">OR.pdf</span>
                  <FaDownload className="download-icon" />
                </div>
                <div className="attachment-item">
                  <FaFile className="attachment-icon" />
                  <span className="attachment-name">ID_Proof.pdf</span>
                  <FaDownload className="download-icon" />
                </div>
              </div>
            </div>

            <div className="reply-section">
              <div className="reply-header">
                <div className="reply-avatar">
                  <FaUserCircle className="avatar-icon" />
                </div>
                <span className="reply-label">Reply to student</span>
              </div>

              <textarea 
                className="reply-textarea" 
                placeholder="Type your message here..."
              ></textarea>

              <div className="reply-actions">
                <button className="request-info-btn">Request for more information</button>
                <button className="send-message-btn">Send Message</button>
              </div>
            </div>
          </div>
        </div>

        <div className="ticket-sidebar">
          <div className="sidebar-card">
            <h3 className="sidebar-card-title">Status Timeline</h3>
            
            <div className="timeline-item">
              <div className="timeline-icon-container">
                <FaCheckCircle className="timeline-check-icon" />
              </div>
              <div className="timeline-content">
                <h4>SUBMITTED</h4>
                <p className="timeline-date">February 16, 2026</p>
                <p className="timeline-description">Initial Student Request</p>
              </div>
            </div>

            <div className="timeline-item">
              <div className="timeline-icon-container">
                <FaCheckCircle className="timeline-check-icon" />
              </div>
              <div className="timeline-content">
                <h4>PROCESSING</h4>
                <p className="timeline-date">February 17, 2026</p>
                <p className="timeline-description">Accepted and processed by Alex Smith</p>
              </div>
            </div>

            <div className="timeline-item">
              <div className="timeline-icon-container inactive">
                <FaCheckCircle className="timeline-check-icon" />
              </div>
              <div className="timeline-content">
                <h4>RESOLVED/REJECTED</h4>
              </div>
            </div>

            <div className="management-control-section">
              <div className="control-item">
                <p className="control-label">URGENCY LEVEL</p>
                <p className="control-value">Normal - Process within 2-3 days</p>
              </div>

              <div className="control-item">
                <p className="control-label">REASON TO</p>
                <select className="control-dropdown">
                  <option>Registrar's Office</option>
                  <option>Finance Office</option>
                  <option>Library</option>
                  <option>Guidance Office</option>
                </select>
              </div>
            </div>
          </div>

          <div className="sidebar-card student-info-card">
            <div className="student-avatar-large">
              <FaUserCircle className="student-avatar-icon" />
            </div>
            
            <h3 className="student-name-text">Ricky Liam</h3>
            <p className="student-level">JUNIOR HIGH SCHOOL</p>

            <div className="student-details">
              <div className="student-detail-row">
                <span className="detail-label-left">ID</span>
                <span className="detail-value-right">05-2324-12345</span>
              </div>
              <div className="student-detail-row">
                <span className="detail-label-left">Grade</span>
                <span className="detail-value-right">Grade 10 - St. Valerius</span>
              </div>
              <div className="student-detail-row">
                <span className="detail-label-left">Email</span>
                <span className="detail-value-right">rl.******an@gmail.com</span>
              </div>
            </div>

            <button className="contact-student-btn">
              <FaEnvelope className="email-icon" />
              CONTACT STUDENT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetails;
