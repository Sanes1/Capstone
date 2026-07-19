import React, { useState, useEffect } from 'react';
import { 
  FaBell, 
  FaUser, 
  FaEnvelope, 
  FaPhone, 
  FaCalendarAlt, 
  FaShieldAlt, 
  FaPen, 
  FaLock, 
  FaKey,
  FaBan,
  FaSignInAlt,
  FaRedo,
  FaPlus,
  FaUserPlus,
  FaCopy,
  FaCheck,
  FaTrash
} from 'react-icons/fa';
import { db, auth } from '../firebase';
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import '../styles/UserManagement.css';

const UserManagement = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [studentId, setStudentId] = useState('');
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [error, setError] = useState('');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdStudent, setCreatedStudent] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Load students from Firestore on component mount
  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      const studentsQuery = query(
        collection(db, 'students'),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(studentsQuery);
      const studentsData = querySnapshot.docs.map(doc => ({
        firestoreId: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate().toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric' 
        }) || 'N/A'
      }));
      setStudents(studentsData);
    } catch (error) {
      console.error('Error loading students:', error);
    }
  };

  // Generate random password (8 characters: letters + numbers)
  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const handleStudentIdChange = (e) => {
    const value = e.target.value;
    // Only allow digits and max 4 characters
    if (/^\d{0,4}$/.test(value)) {
      setStudentId(value);
      setError('');
    }
  };

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate student ID
      if (!studentId || studentId.length !== 4) {
        setError('Student ID must be exactly 4 digits');
        setLoading(false);
        return;
      }

      // Check if student ID already exists
      if (students.some(s => s.id === studentId)) {
        setError('Student ID already exists');
        setLoading(false);
        return;
      }

      if (!studentName.trim()) {
        setError('Please enter student name');
        setLoading(false);
        return;
      }

      if (!studentEmail.trim()) {
        setError('Please enter student email');
        setLoading(false);
        return;
      }

      // Generate random password
      const password = generatePassword();
      setGeneratedPassword(password);

      // Create Firebase Authentication account
      const userCredential = await createUserWithEmailAndPassword(auth, studentEmail, password);
      const user = userCredential.user;

      // Save student data to Firestore
      await addDoc(collection(db, 'students'), {
        id: studentId,
        uid: user.uid,
        name: studentName.trim(),
        email: studentEmail.trim(),
        role: 'student',
        createdAt: serverTimestamp(),
        isActive: true
      });

      // Send credentials via email using local backend
      try {
        const response = await fetch('http://localhost:5000/api/send-credentials', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: studentEmail.trim(),
            studentId: studentId,
            password: password,
            studentName: studentName.trim()
          })
        });

        const data = await response.json();
        
        if (data.success) {
          console.log('✅ Email sent successfully to:', studentEmail);
        } else {
          throw new Error(data.error || 'Failed to send email');
        }
      } catch (emailError) {
        console.error('❌ Failed to send email:', emailError);
        // Continue anyway - account was created successfully
        alert('Account created but email failed to send. Please manually share credentials with student:\nStudent ID: ' + studentId + '\nPassword: ' + password);
      }

      // Reload students list
      await loadStudents();

      // Show simple success message
      setCreatedStudent({
        id: studentId,
        name: studentName.trim(),
        email: studentEmail.trim()
      });
      setShowSuccessModal(true);
      setShowCreateForm(false);
      setStudentId('');
      setStudentName('');
      setStudentEmail('');
      setLoading(false);

    } catch (error) {
      console.error('Error creating student:', error);
      if (error.code === 'auth/email-already-in-use') {
        setError('Email address is already in use');
      } else if (error.code === 'auth/invalid-email') {
        setError('Invalid email address');
      } else if (error.code === 'auth/weak-password') {
        setError('Password is too weak');
      } else {
        setError('Failed to create student account: ' + error.message);
      }
      setLoading(false);
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    setCreatedStudent(null);
  };

  const handleNewStudent = () => {
    setShowCreateForm(true);
    setStudentId('');
    setStudentName('');
    setStudentEmail('');
    setGeneratedPassword('');
    setError('');
  };

  const handleSuspendStudent = (student) => {
    setSelectedStudent(student);
    setConfirmAction('suspend');
    setShowConfirmModal(true);
  };

  const handleDeleteStudent = (student) => {
    setSelectedStudent(student);
    setConfirmAction('delete');
    setShowConfirmModal(true);
  };

  const confirmSuspendOrDelete = async () => {
    if (!selectedStudent) return;

    try {
      if (confirmAction === 'suspend') {
        // Toggle suspension status
        const newStatus = !selectedStudent.isActive;
        await updateDoc(doc(db, 'students', selectedStudent.firestoreId), {
          isActive: newStatus
        });
        await loadStudents();
        alert(`Account ${newStatus ? 'activated' : 'suspended'} successfully!`);
      } else if (confirmAction === 'delete') {
        // First, delete from Firebase Authentication via backend
        try {
          const response = await fetch('http://localhost:5000/api/delete-user', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              uid: selectedStudent.uid
            })
          });

          const data = await response.json();
          
          if (!data.success) {
            throw new Error(data.error || 'Failed to delete from Firebase Auth');
          }
          
          console.log('✅ Deleted from Firebase Auth');
        } catch (authError) {
          console.error('❌ Failed to delete from Firebase Auth:', authError);
          // Continue to delete from Firestore anyway
          alert('Warning: Could not delete from Firebase Authentication. The account will be removed from the database but may still exist in Authentication.');
        }

        // Then delete from Firestore
        await deleteDoc(doc(db, 'students', selectedStudent.firestoreId));
        await loadStudents();
        alert('Account deleted successfully from both database and authentication!');
      }
      setShowConfirmModal(false);
      setSelectedStudent(null);
      setConfirmAction(null);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to perform action: ' + error.message);
    }
  };

  const cancelConfirm = () => {
    setShowConfirmModal(false);
    setSelectedStudent(null);
    setConfirmAction(null);
  };

  const activityHistory = [
    { text: 'System login success', time: 'Today 09:10 am' },
    { text: 'System login success', time: 'Today 09:10 am' },
    { text: 'System login success', time: 'Today 09:10 am' },
    { text: 'System login success', time: 'Today 09:10 am' }
  ];

  return (
    <div className="user-management-container">
      <div className="user-management-header">
        <h1 className="user-management-title">User Management</h1>
        <div className="header-actions">
          <button className="create-student-btn" onClick={handleNewStudent}>
            <FaUserPlus />
            Create Student Account
          </button>
          <div className="form-notification">
            <FaBell className="notification-icon" />
          </div>
        </div>
      </div>

      {showConfirmModal && selectedStudent && (
        <div className="create-student-modal">
          <div className="modal-content confirm-modal">
            <FaBan className="confirm-icon" />
            <h2 className="confirm-title">
              {confirmAction === 'suspend' 
                ? (selectedStudent.isActive ? 'Suspend Account?' : 'Activate Account?')
                : 'Delete Account?'}
            </h2>
            <p className="confirm-message">
              {confirmAction === 'suspend' 
                ? (selectedStudent.isActive 
                    ? `Are you sure you want to suspend ${selectedStudent.name}'s account? They will not be able to log in until reactivated.`
                    : `Are you sure you want to activate ${selectedStudent.name}'s account? They will be able to log in again.`)
                : `Are you sure you want to permanently delete ${selectedStudent.name}'s account? This action cannot be undone.`}
            </p>
            <div className="student-info-box">
              <p><strong>Student ID:</strong> {selectedStudent.id}</p>
              <p><strong>Name:</strong> {selectedStudent.name}</p>
              <p><strong>Email:</strong> {selectedStudent.email}</p>
            </div>
            <div className="modal-actions">
              <button className="cancel-btn-super" onClick={cancelConfirm}>
                Cancel
              </button>
              <button 
                className={confirmAction === 'delete' ? 'delete-confirm-btn' : 'suspend-confirm-btn'}
                onClick={confirmSuspendOrDelete}
              >
                {confirmAction === 'suspend' 
                  ? (selectedStudent.isActive ? 'Suspend' : 'Activate')
                  : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccessModal && createdStudent && (
        <div className="create-student-modal">
          <div className="modal-content success-modal">
            <div className="success-header">
              <FaCheck className="success-icon" />
              <h2 className="success-title">Account Created Successfully!</h2>
            </div>
            
            <p className="success-message">
              The student account has been created and login credentials have been sent to the student's email address.
            </p>

            <div className="credentials-box">
              <div className="credential-row">
                <label className="credential-label">Student ID:</label>
                <span className="credential-value">{createdStudent.id}</span>
              </div>
              
              <div className="credential-row">
                <label className="credential-label">Full Name:</label>
                <span className="credential-value">{createdStudent.name}</span>
              </div>
              
              <div className="credential-row">
                <label className="credential-label">Email Sent To:</label>
                <span className="credential-value">{createdStudent.email}</span>
              </div>
            </div>

            <div className="success-warning">
              <FaEnvelope className="warning-icon" />
              <p>The student should receive an email with their login credentials shortly. Please ask them to check their inbox (and spam folder).</p>
            </div>

            <div className="modal-actions">
              <button className="success-close-btn" onClick={handleCloseSuccessModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showCreateForm && (
        <div className="create-student-modal">
          <div className="modal-content">
            <h2 className="modal-title">Create New Student Account</h2>
            <p className="modal-subtitle">Enter student information to generate account credentials</p>

            {error && (
              <div className="error-message-super">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateStudent} className="create-student-form">
              <div className="form-group-super">
                <label className="form-label-super">Student ID (4 digits)</label>
                <input
                  type="text"
                  className="form-input-super"
                  value={studentId}
                  onChange={handleStudentIdChange}
                  placeholder="e.g., 1234"
                  maxLength="4"
                  required
                />
              </div>

              <div className="form-group-super">
                <label className="form-label-super">Full Name</label>
                <input
                  type="text"
                  className="form-input-super"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="Enter student's full name"
                  required
                />
              </div>

              <div className="form-group-super">
                <label className="form-label-super">Email Address</label>
                <input
                  type="email"
                  className="form-input-super"
                  value={studentEmail}
                  onChange={(e) => setStudentEmail(e.target.value)}
                  placeholder="student@asj.edu"
                  required
                />
              </div>

              <div className="password-info-box">
                <FaKey className="password-info-icon" />
                <p>A random password will be generated automatically for this account</p>
              </div>

              <div className="modal-actions">
                <button 
                  type="button" 
                  className="cancel-btn-super" 
                  onClick={() => setShowCreateForm(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button type="submit" className="create-btn-super" disabled={loading}>
                  <FaPlus />
                  {loading ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="students-list-section">
        <h2 className="section-title-super">Student Accounts</h2>
        {students.length === 0 ? (
          <p className="no-students-message">No student accounts yet. Click "Create Student Account" to add one.</p>
        ) : (
          <div className="students-table">
            <div className="table-header">
              <div className="table-cell">Student ID</div>
              <div className="table-cell">Name</div>
              <div className="table-cell">Email</div>
              <div className="table-cell">Created</div>
              <div className="table-cell">Actions</div>
            </div>
            {students.map((student) => (
              <div key={student.firestoreId || student.id} className="table-row">
                <div className="table-cell">{student.id}</div>
                <div className="table-cell">
                  {student.name}
                  {!student.isActive && <span className="suspended-badge">Suspended</span>}
                </div>
                <div className="table-cell">{student.email}</div>
                <div className="table-cell">{student.createdAt}</div>
                <div className="table-cell">
                  <button 
                    className="table-action-btn reset"
                    onClick={() => handleSuspendStudent(student)}
                  >
                    <FaBan />
                    {student.isActive ? 'Suspend' : 'Activate'}
                  </button>
                  <button 
                    className="table-action-btn delete"
                    onClick={() => handleDeleteStudent(student)}
                  >
                    <FaKey />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="user-management-content">
        <div className="user-profile-card">
          <div className="user-avatar">
            <FaUser className="avatar-icon" />
          </div>
          
          <h2 className="user-name">Alex Smith</h2>
          <p className="user-role">Staff - Finance</p>
          
          <div className="user-details">
            <div className="detail-row">
              <FaEnvelope className="detail-icon" />
              <div className="detail-info">
                <p className="detail-label">Email Address</p>
                <p className="detail-value">alex.smith@gmail.com</p>
              </div>
            </div>
            
            <div className="detail-row">
              <FaPhone className="detail-icon" />
              <div className="detail-info">
                <p className="detail-label">Phone Number</p>
                <p className="detail-value">09912345678</p>
              </div>
            </div>
            
            <div className="detail-row">
              <FaCalendarAlt className="detail-icon" />
              <div className="detail-info">
                <p className="detail-label">Member Since</p>
                <p className="detail-value">Aug 11, 2020</p>
              </div>
            </div>
          </div>
          
          <div className="admin-actions">
            <div className="admin-actions-header">
              <FaShieldAlt className="shield-icon" />
              <h3 className="admin-actions-title">Administrative Action</h3>
            </div>
            
            <button className="action-button">
              <FaPen className="action-icon" />
              Edit Profile
            </button>
            
            <button className="action-button">
              <FaLock className="action-icon" />
              Change Permission
            </button>
            
            <button className="action-button">
              <FaKey className="action-icon" />
              Reset Password
            </button>
            
            <button className="action-button suspend">
              <FaBan className="action-icon" />
              Suspend Account
            </button>
          </div>
        </div>
        
        <div className="user-activity-section">
          <div className="activity-stats">
            <div className="stat-box">
              <p className="stat-header-text">Total Tickets Handled</p>
              <p className="stat-period">Monthly</p>
              <h3 className="stat-number">20</h3>
            </div>
            
            <div className="stat-box">
              <p className="stat-header-text">Avg. Response Time</p>
              <p className="stat-period">Monthly</p>
              <h3 className="stat-number">2.5hrs</h3>
            </div>
          </div>
          
          <div className="activity-history-card">
            <div className="activity-history-header">
              <h3 className="activity-history-title">System Activity History</h3>
            </div>
            
            <div className="activity-list">
              {activityHistory.map((activity, index) => (
                <div key={index} className="activity-item">
                  <div className="activity-icon-container">
                    <FaSignInAlt className="activity-icon" />
                  </div>
                  <div className="activity-info">
                    <p className="activity-text">{activity.text}</p>
                    <p className="activity-time">{activity.time}</p>
                  </div>
                </div>
              ))}
              
              <button className="load-more">
                <FaRedo className="load-more-icon" />
                Load full Audit Log
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
