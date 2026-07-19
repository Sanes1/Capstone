import { useState } from 'react';
import { MdNotifications, MdUploadFile } from 'react-icons/md';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import '../styles/NewRequest.css';

function NewRequest({ onNavigate }) {
  const [selectedOffice, setSelectedOffice] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  const generateRequestId = (officeName) => {
    // Generate format: FIN-123-654-789
    const officePrefix = officeName.substring(0, 3).toUpperCase();
    const randomNum1 = Math.floor(100 + Math.random() * 900); // 3 digits
    const randomNum2 = Math.floor(100 + Math.random() * 900); // 3 digits
    const randomNum3 = Math.floor(100 + Math.random() * 900); // 3 digits
    return `${officePrefix}-${randomNum1}-${randomNum2}-${randomNum3}`;
  };

  const handleSubmit = async () => {
    setError('');

    // Validation
    if (!selectedOffice) {
      setError('Please select an office');
      return;
    }

    if (!subject.trim()) {
      setError('Please enter a subject');
      return;
    }

    if (!description.trim()) {
      setError('Please provide a detailed description');
      return;
    }

    setLoading(true);

    try {
      // Get student data from localStorage
      const studentData = localStorage.getItem('studentData');
      if (!studentData) {
        throw new Error('Student data not found. Please login again.');
      }

      const student = JSON.parse(studentData);
      const selectedOfficeData = offices.find(o => o.id === selectedOffice);
      
      // Generate unique request ID
      const requestId = generateRequestId(selectedOfficeData.name);

      // Prepare request data
      const requestData = {
        requestId: requestId,
        studentId: student.id,
        studentName: student.name,
        studentEmail: student.email,
        office: selectedOfficeData.name,
        officeId: selectedOffice,
        subject: subject.trim(),
        description: description.trim(),
        status: 'Pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        attachments: [], // For future file upload implementation
        isGuest: false
      };

      // Save to Firebase
      const docRef = await addDoc(collection(db, 'requests'), requestData);
      console.log('✅ Request created with ID:', docRef.id);

      // Show success message
      alert('Request submitted successfully! Your request ID is: ' + requestId);

      // Reset form
      setSelectedOffice('');
      setSubject('');
      setDescription('');

      // Navigate back to request history
      if (onNavigate) {
        onNavigate('request');
      }

    } catch (error) {
      console.error('❌ Error submitting request:', error);
      setError('Failed to submit request: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

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
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

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
          <button 
            className="cancel-btn" 
            onClick={() => onNavigate('request')}
            disabled={loading}
          >
            Cancel
          </button>
          <button 
            className="submit-btn" 
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit Request'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default NewRequest;
