import React, { useState } from 'react';
import { MdNotifications, MdUploadFile } from 'react-icons/md';
import '../styles/NewRequest.css';

function NewRequest({ onNavigate }) {
  const [selectedOffice, setSelectedOffice] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');

  const offices = [
    {
      id: 'finance',
      name: 'Finance',
      description: 'Manages tuition payments, student balances, billing concerns, and other school-related financial transactions.'
    },
    {
      id: 'library',
      name: 'Library',
      description: 'Manages book borrowing/returning, library accounts, and student concerns related to library services and resources.'
    },
    {
      id: 'registrar',
      name: 'Registrar',
      description: 'Handles student records such as enrollment, grades, certificates, transcripts, and other official academic documents.'
    },
    {
      id: 'guidance',
      name: 'Guidance',
      description: 'Handles student behavior concerns, violations, and disciplinary cases to maintain order and safety in school.'
    }
  ];

  return (
    <div className="new-request-page">
      <div className="breadcrumb">
        <span className="clickable" onClick={() => onNavigate('request')}>Request History</span>
        <span className="separator">/</span>
        <span className="clickable" onClick={() => onNavigate('request-details')}>Request Details</span>
        <span className="separator">/</span>
        <span className="active">New Request</span>
      </div>

      <div className="page-header">
        <h1>Submit New Request</h1>
        <div className="header-actions">
          <button className="notification-btn">
            <MdNotifications />
          </button>
        </div>
      </div>

      <div className="request-form">
        <div className="form-section">
          <h3>Select Office</h3>
          <div className="office-grid">
            {offices.map((office) => (
              <div
                key={office.id}
                className={`office-card ${selectedOffice === office.id ? 'selected' : ''}`}
                onClick={() => setSelectedOffice(office.id)}
              >
                <div className="radio-button">
                  {selectedOffice === office.id && <div className="radio-inner"></div>}
                </div>
                <div className="office-info">
                  <h4>{office.name}</h4>
                  <p>{office.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="form-section">
          <label htmlFor="subject">Subject</label>
          <input
            id="subject"
            type="text"
            placeholder="Briefly describe your issues"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>

        <div className="form-section">
          <label htmlFor="description">Detailed Description</label>
          <textarea
            id="description"
            placeholder="Please provide as much detail as possible..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={6}
          />
        </div>

        <div className="form-section">
          <label>Attach File <span className="optional">(Optional)</span></label>
          <div className="upload-area">
            <MdUploadFile className="upload-icon" />
            <p className="upload-text">Click to upload or drag and drop</p>
            <p className="upload-limit">Attach documents (Max 5MB)</p>
          </div>
        </div>

        <div className="form-actions">
          <button className="cancel-btn" onClick={() => onNavigate('request')}>Cancel</button>
          <button className="submit-btn">Submit Request</button>
        </div>
      </div>
    </div>
  );
}

export default NewRequest;
