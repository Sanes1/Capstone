import React, { useState } from 'react';
import { FaBell, FaEllipsisV, FaFileAlt } from 'react-icons/fa';
import '../styles/EditRequestForm.css';

const EditRequestForm = () => {
  const [selectedOffice, setSelectedOffice] = useState('finance');

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
    <div className="edit-request-form-container">
      <div className="form-header">
        <h1 className="form-title">Request Form</h1>
        <div className="form-notification">
          <FaBell className="notification-icon" />
        </div>
      </div>

      <div className="form-content">
        <div className="form-section">
          <div className="section-header">
            <h2 className="section-title">Select Office</h2>
            <FaEllipsisV className="section-options" />
          </div>
          <div className="office-cards">
            {offices.map((office) => (
              <div
                key={office.id}
                className={`office-card ${selectedOffice === office.id ? 'selected' : ''}`}
                onClick={() => setSelectedOffice(office.id)}
              >
                <div className="radio-circle"></div>
                <div className="office-info">
                  <h3 className="office-name">{office.name}</h3>
                  <p className="office-description">{office.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="form-section">
          <div className="section-header">
            <h2 className="section-title">Subject</h2>
            <FaEllipsisV className="section-options" />
          </div>
          <input
            type="text"
            className="form-input"
            placeholder="Briefly describe your issues"
          />
        </div>

        <div className="form-section">
          <div className="section-header">
            <h2 className="section-title">Detailed Description</h2>
            <FaEllipsisV className="section-options" />
          </div>
          <textarea
            className="form-textarea"
            placeholder="Please provide as much detail as possible..."
          />
        </div>

        <div className="file-upload-section">
          <div className="section-header">
            <label className="file-upload-label">
              Attach File <span>(Optional)</span>
            </label>
            <FaEllipsisV className="section-options" />
          </div>
          <div className="file-upload-area">
            <FaFileAlt className="file-icon" />
            <p className="upload-text">
              <strong>Click to upload</strong> or drag and drop
            </p>
            <p className="upload-subtext">Attach documents (Max 5MB)</p>
          </div>
        </div>

        <div className="form-actions">
          <button className="cancel-button">Cancel</button>
          <button className="submit-button">Submit Request</button>
        </div>
      </div>
    </div>
  );
};

export default EditRequestForm;
