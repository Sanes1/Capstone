import { useState, useRef, useEffect } from 'react';
import { MdUploadFile, MdClose, MdCheckCircle, MdWarning, MdError } from 'react-icons/md';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { validateContent } from '../utils/contentModeration';
import { notifyStaffNewRequest } from '../utils/notificationHelper';
import '../styles/NewRequest.css';

function NewRequest({ onNavigate }) {
  const [selectedOffice, setSelectedOffice] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const fileInputRef = useRef(null);
  
  // Validation states
  const [validationResult, setValidationResult] = useState(null);
  const [isValidating, setIsValidating] = useState(false);

  const offices = [
    {
      id: 'finance',
      name: 'Finance',
      description: 'Manages tuition payments, student balances, billing concerns, and other school-related financial transactions.',
      subjects: [
        'Tuition Payment Inquiry',
        'Balance Verification',
        'Payment Plan Request',
        'Receipt Request',
        'Refund Request',
        'Scholarship Inquiry',
        'Other Financial Concern'
      ]
    },
    {
      id: 'library',
      name: 'Library',
      description: 'Manages book borrowing/returning, library accounts, and student concerns related to library services and resources.',
      subjects: [
        'Book Borrowing Issue',
        'Book Return Concern',
        'Lost Book Report',
        'Library Card Issue',
        'Overdue Fine Inquiry',
        'Research Assistance',
        'Other Library Concern'
      ]
    },
    {
      id: 'registrar',
      name: 'Registrar',
      description: 'Handles student records such as enrollment, grades, certificates, transcripts, and other official academic documents.',
      subjects: [
        'Transcript Request',
        'Certificate Request',
        'Document Request',
        'Grade Inquiry',
        'Enrollment Verification',
        'Record Correction',
        'Document Authentication',
        'Other Registrar Concern'
      ]
    },
    {
      id: 'guidance',
      name: 'Guidance',
      description: 'Handles student behavior concerns, violations, and disciplinary cases to maintain order and safety in school.',
      subjects: [
        'Counseling Appointment',
        'Disciplinary Case Inquiry',
        'Behavior Report',
        'Mental Health Support',
        'Academic Guidance',
        'Career Counseling',
        'Other Guidance Concern'
      ]
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

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    
    // Filter files by size (max 5MB)
    const validFiles = [];
    const invalidFiles = [];
    
    files.forEach(file => {
      if (file.size <= 5 * 1024 * 1024) { // 5MB in bytes
        validFiles.push(file);
      } else {
        invalidFiles.push(file.name);
      }
    });

    if (invalidFiles.length > 0) {
      setError(`These files exceed 5MB: ${invalidFiles.join(', ')}`);
      setTimeout(() => setError(''), 5000);
    }

    if (validFiles.length > 0) {
      setUploadedFiles(prev => [...prev, ...validFiles]);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Debounced AI validation effect
  useEffect(() => {
    if (!description.trim() || !subject) {
      setValidationResult(null);
      return;
    }

    setIsValidating(true);
    
    // Debounce validation by 1200ms to avoid excessive AI calls
    const timeoutId = setTimeout(async () => {
      try {
        const result = await validateContent(subject, description);
        setValidationResult(result);
      } catch (error) {
        console.error('Validation error:', error);
        setValidationResult({
          isValid: true,
          errors: [],
          warnings: ['Validation temporarily unavailable. Your request will be reviewed.'],
          language: 'unknown'
        });
      } finally {
        setIsValidating(false);
      }
    }, 1200);

    return () => clearTimeout(timeoutId);
  }, [description, subject]);

  const uploadFilesToStorage = async () => {
    const uploadedFileUrls = [];

    for (let i = 0; i < uploadedFiles.length; i++) {
      const file = uploadedFiles[i];

      try {
        // Convert file to base64
        const base64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        uploadedFileUrls.push({
          name: file.name,
          data: base64, // Store base64 data directly
          size: file.size,
          type: file.type,
          uploadedAt: new Date().toISOString()
        });
        
        console.log(`✅ Converted file ${i + 1}/${uploadedFiles.length}:`, file.name);
      } catch (uploadError) {
        console.error(`❌ Error converting file ${file.name}:`, uploadError);
        throw new Error(`Failed to process ${file.name}`);
      }
    }

    return uploadedFileUrls;
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

    // Content validation check
    if (validationResult && !validationResult.isValid) {
      setError('Please fix the validation errors before submitting');
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

      // Convert files to base64 if any
      let attachments = [];
      if (uploadedFiles.length > 0) {
        console.log(`📤 Processing ${uploadedFiles.length} file(s)...`);
        attachments = await uploadFilesToStorage();
      }

      // Prepare request data
      const requestData = {
        requestId: requestId,
        studentId: student.studentId || student.id,
        studentUid: student.uid,
        studentName: student.name || `${student.firstName} ${student.lastName}`.trim(),
        studentEmail: student.email,
        office: selectedOfficeData.name,
        officeId: selectedOffice,
        subject: subject.trim(),
        description: description.trim(),
        status: 'Pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        attachments: attachments,
        isGuest: false
      };

      // Save to Firebase
      const docRef = await addDoc(collection(db, 'requests'), requestData);
      console.log('✅ Request created with ID:', docRef.id);

      // Notify all staff in the target office about the new request
      await notifyStaffNewRequest(
        selectedOfficeData.name,
        requestId,
        subject.trim(),
        student.name || `${student.firstName} ${student.lastName}`.trim()
      );

      // Show success message
      alert(`Request submitted successfully! Your request ID is: ${requestId}${attachments.length > 0 ? `\n${attachments.length} file(s) attached` : ''}`);

      // Reset form
      setSelectedOffice('');
      setSubject('');
      setDescription('');
      setUploadedFiles([]);

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
                onClick={() => {
                  setSelectedOffice(office.id);
                  setSubject(''); // Reset subject when office changes
                }}
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
          <select
            id="subject"
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

        <div className="form-section">
          <label htmlFor="description">
            Detailed Description
            {isValidating && <span className="validation-status validating"> (Checking...)</span>}
            {validationResult && validationResult.isValid && validationResult.errors.length === 0 && (
              <span className="validation-status valid">
                <MdCheckCircle /> Valid
              </span>
            )}
          </label>
          <textarea
            id="description"
            placeholder="Please provide as much detail as possible..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={6}
            className={
              validationResult && !validationResult.isValid ? 'has-error' :
              validationResult && validationResult.warnings.length > 0 ? 'has-warning' : ''
            }
          />
          
          {/* Validation feedback */}
          {validationResult && (
            <div className="validation-feedback">
              {/* Errors */}
              {validationResult.errors.length > 0 && (
                <div className="validation-errors">
                  {validationResult.errors.map((err, index) => (
                    <div key={index} className="validation-message error">
                      <MdError className="icon" />
                      <span>{err}</span>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Warnings */}
              {validationResult.warnings.length > 0 && (
                <div className="validation-warnings">
                  {validationResult.warnings.map((warn, index) => (
                    <div key={index} className="validation-message warning">
                      <MdWarning className="icon" />
                      <span>{warn}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="form-section">
          <label>Attach File <span className="optional">(Optional - Max 5MB per file)</span></label>
          
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            accept="image/*,.pdf,.doc,.docx,.txt"
          />
          
          <div className="upload-area" onClick={() => fileInputRef.current?.click()}>
            <MdUploadFile className="upload-icon" />
            <p className="upload-text">Click to upload or drag and drop</p>
            <p className="upload-limit">Attach documents (Max 5MB per file)</p>
          </div>

          {uploadedFiles.length > 0 && (
            <div className="uploaded-files-list">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="uploaded-file-item">
                  <div className="file-info">
                    <span className="file-name">{file.name}</span>
                    <span className="file-size">{formatFileSize(file.size)}</span>
                  </div>
                  <button
                    type="button"
                    className="remove-file-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFile(index);
                    }}
                  >
                    <MdClose />
                  </button>
                </div>
              ))}
            </div>
          )}
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
