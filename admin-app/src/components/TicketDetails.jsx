import React from 'react';
import { FaBell, FaUndo, FaCheck, FaFileAlt, FaDownload, FaUserCircle, FaEnvelope, FaCheckCircle } from 'react-icons/fa';
import '../styles/TicketDetails.css';

const TicketDetails = ({ department, onNavigate }) => {
  const handleBackToTickets = () => {
    onNavigate('my-tickets');
  };

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
                <h2>FINANCIAL INQUIRY: TUITION PAYMENT</h2>
                <p className="ticket-number-display">#FIN-123-654-789</p>
              </div>
              <span className="ticket-status-badge">In Progress</span>
            </div>
            
            <div className="ticket-action-buttons">
              <button className="return-btn">
                <FaUndo />
                Return Ticket
              </button>
              <button className="resolve-btn">
                <FaCheck />
                Resolve Ticket
              </button>
            </div>
            
            <p className="submitted-time">Submitted 5 hours ago</p>
          </div>

          <div className="submission-section">
            <div className="section-header-row">
              <h3 className="section-title">Original Submission</h3>
              <span className="created-date">Created on February 16, 2026</span>
            </div>
            
            <div className="submission-message">
              "Good day! I would like to request assistance regarding my tuition payment issue. May I ask for your help in checking and clarifying my balance/records? Thank you so much."
            </div>
            
            <div className="attachments">
              <div className="attachment-file">
                <FaFileAlt className="file-icon" />
                <span className="file-name">OR.pdf</span>
                <FaDownload className="download-icon" />
              </div>
              <div className="attachment-file">
                <FaFileAlt className="file-icon" />
                <span className="file-name">ID_Proof.pdf</span>
                <FaDownload className="download-icon" />
              </div>
            </div>
            
            <div className="reply-section">
              <div className="reply-header">
                <FaUserCircle className="reply-avatar" />
                <span className="reply-label">Reply to student</span>
              </div>
              
              <textarea 
                className="reply-textarea"
                placeholder="Type your message here..."
              />
              
              <div className="reply-actions">
                <button className="request-info-btn">Request for more information</button>
                <button className="send-message-btn">Send Message</button>
              </div>
            </div>
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
                <p className="timeline-date">February 16, 2026</p>
                <p className="timeline-description">Initial Student Request</p>
              </div>
            </div>
            
            <div className="timeline-item">
              <div className="timeline-icon complete">
                <FaCheckCircle />
              </div>
              <div className="timeline-info">
                <p className="timeline-status">PROCESSING</p>
                <p className="timeline-date">February 17, 2026</p>
                <p className="timeline-description">Accepted and processed by Alex Smith</p>
              </div>
            </div>
            
            <div className="timeline-item">
              <div className="timeline-icon incomplete">
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'white' }}></div>
              </div>
              <div className="timeline-info">
                <p className="timeline-status">RESOLVED/REJECTED</p>
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
              <p className="field-label">REASON TO</p>
              <select className="field-select">
                <option>Registrar's Office</option>
                <option>Finance Office</option>
                <option>Library</option>
                <option>Guidance Office</option>
              </select>
            </div>
          </div>

          <div className="student-info-card">
            <div className="student-avatar">
              <FaUserCircle className="student-avatar-icon" />
            </div>
            <h4 className="student-name">Ricky Liam</h4>
            <p className="student-school">Junior High School</p>
            
            <div className="student-details">
              <div className="student-detail-row">05-2324-12345</div>
              <div className="student-detail-row">Grade 10 - St. Valerius</div>
              <div className="student-detail-row">rl.*****am @gmail.com</div>
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
