import React, { useState } from 'react';
import { FaFileUpload, FaUserCircle } from 'react-icons/fa';
import { MdExitToApp } from 'react-icons/md';
import '../styles/GuestLogin.css';

const GuestLogin = ({ onLogin }) => {
  const [requestId, setRequestId] = useState('');
  const [officeCode, setOfficeCode] = useState('');
  const [selectedOffice, setSelectedOffice] = useState('finance');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [attachmentFile, setAttachmentFile] = useState(null);
  const [authFile, setAuthFile] = useState(null);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('studentLoggedIn');
      localStorage.removeItem('studentIsGuest');
      window.location.href = '/';
    }
  };

  const offices = [
    {
      id: 'finance',
      name: 'Finance',
      description: 'Manages tuition payments, student balances, billing concerns, and other school-related financial transactions.',
      subjects: ['Balance Verification', 'Payment Plan', 'Refund Request', 'Billing Inquiry']
    },
    {
      id: 'library',
      name: 'Library',
      description: 'Manages book borrowing/returning, library accounts, and student concerns related to library services and resources.',
      subjects: ['Book Request', 'Lost Book Report', 'Library Card Issue', 'Resource Access']
    },
    {
      id: 'registrar',
      name: 'Registrar',
      description: 'Handles student records such as enrollment, grades, certificates, transcripts, and other official academic documents.',
      subjects: ['Document Request', 'Grade Inquiry', 'Enrollment Issue', 'Transcript Request']
    },
    {
      id: 'guidance',
      name: 'Guidance',
      description: 'Handles student behavior concerns, incidents, and disciplinary cases to maintain order and safety in school.',
      subjects: ['Counseling Request', 'Disciplinary Appeal', 'Behavior Report', 'Support Services']
    }
  ];

  const handleBrowseConfirm = () => {
    if (requestId && officeCode && authFile) {
      alert('Checking request status...');
    } else {
      alert('Please fill in all required fields and upload authorization proof');
    }
  };

  const handleSubmitRequest = () => {
    if (selectedOffice && subject && description) {
      alert('Request submitted successfully!');
    } else {
      alert('Please fill in all required fields');
    }
  };

  // Buttons stay grayed out until every required input for that section is filled
  const canBrowse = requestId.trim() !== '' && officeCode.trim() !== '' && authFile !== null;
  const canSubmit = !!selectedOffice && subject.trim() !== '' && description.trim() !== '';

  return (
    <div className="guest-login-container">
      <div className="guest-header">
        <div className="guest-header-content">
          <img src="/logo.jpg" alt="Academia De San Jose" className="guest-logo" onError={(e) => e.target.style.display = 'none'} />
          <h1 className="guest-school-name">Academia De San Jose</h1>
        </div>
        <div className="guest-header-right">
          <div className="guest-account-badge">
            <span>Guest Account</span>
            <FaUserCircle className="guest-icon" />
          </div>
          <button className="guest-logout-btn" onClick={handleLogout}>
            <MdExitToApp /> Logout
          </button>
        </div>
      </div>

      <div className="guest-content">
        {/* Browse Request Status Section */}
        <div className="guest-section">
          <h2 className="section-title-guest">Browse Request Status</h2>

          <div className="field-grid">
            <div className="form-group-guest">
              <label className="form-label-guest" htmlFor="guestRequestId">Enter Request ID</label>
              <input
                id="guestRequestId"
                type="text"
                className="form-input-guest"
                value={requestId}
                onChange={(e) => setRequestId(e.target.value)}
                placeholder="#LIB-100-010-001"
              />
            </div>

            <div className="form-group-guest">
              <label className="form-label-guest" htmlFor="guestOfficeCode">Enter Office Code</label>
              <input
                id="guestOfficeCode"
                type="text"
                className="form-input-guest"
                value={officeCode}
                onChange={(e) => setOfficeCode(e.target.value)}
                placeholder="LIB-001"
              />
            </div>
          </div>

          <div className="form-actions-guest">
            <button className="cancel-btn-guest" onClick={() => window.location.reload()}>
              Cancel
            </button>
            <button className="confirm-btn-guest" onClick={handleBrowseConfirm} disabled={!canBrowse}>
              Confirm
            </button>
          </div>
        </div>

        {/* Submit New Request Section */}
        <div className="guest-section">
          <h2 className="section-title-guest">Submit New Request</h2>

          <div className="form-group-guest">
            <label className="form-label-guest">Select Office</label>
            <div className="office-grid">
              {offices.map((office) => (
                <div
                  key={office.id}
                  className={`office-card-guest ${selectedOffice === office.id ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedOffice(office.id);
                    setSubject(''); // Reset subject when office changes
                  }}
                >
                  <div className="office-radio">
                    {selectedOffice === office.id && <div className="radio-dot"></div>}
                  </div>
                  <div className="office-info">
                    <h4 className="office-name">{office.name}</h4>
                    <p className="office-description">{office.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="form-group-guest">
            <label className="form-label-guest">Subject</label>
            <select
              className="form-select-guest"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={!selectedOffice}
            >
              <option value="">
                {selectedOffice ? 'Select a subject' : 'Please select an office first'}
              </option>
              {selectedOffice && offices.find(o => o.id === selectedOffice)?.subjects.map((subj, index) => (
                <option key={index} value={subj}>
                  {subj}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group-guest">
            <label className="form-label-guest">Detailed Description</label>
            <textarea
              className="form-textarea-guest"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please provide as much detail as possible..."
              rows="5"
            />
          </div>

          <div className="form-group-guest">
            <label className="form-label-guest">Attach Files (Max 5mb)</label>
            <div className="upload-box-auth">
              <span className="required-badge">Required</span>
              <FaFileUpload className="upload-icon-auth" />
              <p className="upload-text-auth">
                Upload Authorization Proof (ex. Authorization Letter, valid ID...)
              </p>
              <input
                type="file"
                className="file-input-hidden"
                onChange={(e) => setAuthFile(e.target.files[0])}
                accept=".pdf,.doc,.docx,.jpg,.png"
              />
            </div>
          </div>

          <div className="form-group-guest">
            <label className="form-label-guest">Attach File <span className="optional-guest">(Optional)</span></label>
            <div className="upload-box-dashed">
              <FaFileUpload className="upload-icon-large" />
              <p className="upload-text-main">Click to upload or drag and drop</p>
              <p className="upload-text-sub">Attach documents (Max 5mb)</p>
              <input
                type="file"
                className="file-input-hidden"
                onChange={(e) => setAttachmentFile(e.target.files[0])}
                accept=".pdf,.doc,.docx,.jpg,.png"
              />
            </div>
          </div>

          <div className="form-actions-guest">
            <button className="cancel-btn-guest" onClick={() => window.location.reload()}>
              Cancel
            </button>
            <button className="submit-btn-guest" onClick={handleSubmitRequest} disabled={!canSubmit}>
              Submit Request
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuestLogin;
