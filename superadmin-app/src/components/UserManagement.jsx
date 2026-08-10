import React, { useState, useEffect } from 'react';import {
  FaEnvelope,
  FaKey,
  FaBan,
  FaPlus,
  FaUserPlus,
  FaCheck,
  FaSearch
} from 'react-icons/fa';
import { db, auth } from '../firebase';
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import NotificationBell from './NotificationBell';
import '../styles/UserManagement.css';

const UserManagement = () => {
  const [activeTab, setActiveTab] = useState('students'); // 'students' or 'staff'
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [studentId, setStudentId] = useState('');
  const [studentFirstName, setStudentFirstName] = useState('');
  const [studentLastName, setStudentLastName] = useState('');
  const [studentMiddleName, setStudentMiddleName] = useState('');
  const [studentSuffix, setStudentSuffix] = useState('');
  const [studentGradeLevel, setStudentGradeLevel] = useState('');
  const [studentSection, setStudentSection] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  
  // Staff form fields
  const [staffFirstName, setStaffFirstName] = useState('');
  const [staffLastName, setStaffLastName] = useState('');
  const [staffMiddleName, setStaffMiddleName] = useState('');
  const [staffSuffix, setStaffSuffix] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffOffice, setStaffOffice] = useState('finance');
  const [staffUsername, setStaffUsername] = useState('');
  
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [error, setError] = useState('');
  const [students, setStudents] = useState([]);
  const [staffMembers, setStaffMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdStudent, setCreatedStudent] = useState(null);
  const [createdStaff, setCreatedStaff] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(null);

  // Frontend-only search + pagination state
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 8;

  const resetPagination = () => setCurrentPage(1);

  const filterList = (items) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) =>
      [item.name, item.firstName, item.lastName, item.email, item.username, item.id, item.office]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(q))
    );
  };

  const paginate = (items) => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return {
      pageItems: items.slice(start, start + PAGE_SIZE),
      totalPages: Math.max(1, Math.ceil(items.length / PAGE_SIZE))
    };
  };

  const visibleStudents = paginate(filterList(students));
  const visibleStaff = paginate(filterList(staffMembers));

  const offices = [
    { id: 'finance', name: 'Finance' },
    { id: 'library', name: 'Library' },
    { id: 'guidance', name: 'Guidance' },
    { id: 'registrar', name: 'Registrar' }
  ];

  // Load students and staff from Firestore on component mount
  useEffect(() => {
    loadStudents();
    loadStaff();
  }, []);

  const loadStaff = async () => {
    try {
      const staffQuery = query(
        collection(db, 'staff'),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(staffQuery);
      const staffData = querySnapshot.docs.map(doc => ({
        firestoreId: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate().toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric' 
        }) || 'N/A'
      }));
      setStaffMembers(staffData);
    } catch (error) {
      console.error('Error loading staff:', error);
    }
  };

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

      if (!studentFirstName.trim()) {
        setError('Please enter student first name');
        setLoading(false);
        return;
      }

      if (!studentLastName.trim()) {
        setError('Please enter student last name');
        setLoading(false);
        return;
      }

      if (!studentEmail.trim()) {
        setError('Please enter student email');
        setLoading(false);
        return;
      }

      if (!studentGradeLevel.trim()) {
        setError('Please select grade level');
        setLoading(false);
        return;
      }

      if (!studentSection.trim()) {
        setError('Please enter section');
        setLoading(false);
        return;
      }

      // Generate random password
      const password = generatePassword();
      setGeneratedPassword(password);

      // Create Firebase Authentication account
      const userCredential = await createUserWithEmailAndPassword(auth, studentEmail, password);
      const user = userCredential.user;

      // Build full name
      const middleInitial = studentMiddleName ? studentMiddleName.charAt(0).toUpperCase() + '.' : '';
      const fullName = `${studentFirstName} ${middleInitial} ${studentLastName}${studentSuffix ? ' ' + studentSuffix : ''}`.replace(/\s+/g, ' ').trim();

      // Save student data to Firestore
      await addDoc(collection(db, 'students'), {
        id: studentId,
        uid: user.uid,
        firstName: studentFirstName.trim(),
        lastName: studentLastName.trim(),
        middleName: studentMiddleName.trim(),
        middleInitial: studentMiddleName ? studentMiddleName.charAt(0).toUpperCase() : '',
        suffix: studentSuffix.trim(),
        gradeLevel: studentGradeLevel.trim(),
        section: studentSection.trim(),
        name: fullName,
        fullName: fullName,
        email: studentEmail.trim(),
        role: 'student',
        createdAt: serverTimestamp(),
        isActive: true,
        mustChangePassword: true // Force password change on first login
      });

      // Send credentials via email
      try {
        const apiUrl = process.env.NODE_ENV === 'production' 
          ? '/api/send-student-email'
          : 'http://localhost:5000/api/send-credentials';
          
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: studentEmail.trim(),
            studentId: studentId,
            password: password,
            studentName: fullName
          })
        });

        const result = await response.json();
        
        if (result.success) {
          console.log('✅ Email sent successfully to:', studentEmail);
        } else {
          throw new Error(result.error || 'Failed to send email');
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
        name: fullName,
        email: studentEmail.trim()
      });
      setShowSuccessModal(true);
      setShowCreateForm(false);
      setStudentId('');
      setStudentFirstName('');
      setStudentLastName('');
      setStudentMiddleName('');
      setStudentSuffix('');
      setStudentGradeLevel('');
      setStudentSection('');
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
    setCreatedStaff(null);
  };

  const handleNewStudent = () => {
    setActiveTab('students');
    setShowCreateForm(true);
    setStudentId('');
    setStudentFirstName('');
    setStudentLastName('');
    setStudentMiddleName('');
    setStudentSuffix('');
    setStudentGradeLevel('');
    setStudentSection('');
    setStudentEmail('');
    setGeneratedPassword('');
    setError('');
  };

  const handleNewStaff = () => {
    setActiveTab('staff');
    setShowCreateForm(true);
    setStaffFirstName('');
    setStaffLastName('');
    setStaffMiddleName('');
    setStaffSuffix('');
    setStaffEmail('');
    setStaffOffice('finance');
    setStaffUsername('');
    setGeneratedPassword('');
    setError('');
  };

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!staffFirstName.trim()) {
        setError('Please enter staff first name');
        setLoading(false);
        return;
      }

      if (!staffLastName.trim()) {
        setError('Please enter staff last name');
        setLoading(false);
        return;
      }

      if (!staffEmail.trim()) {
        setError('Please enter staff email');
        setLoading(false);
        return;
      }

      if (!staffUsername.trim()) {
        setError('Please enter username');
        setLoading(false);
        return;
      }

      // Generate random password
      const password = generatePassword();
      setGeneratedPassword(password);

      // Create Firebase Authentication account
      const userCredential = await createUserWithEmailAndPassword(auth, staffEmail, password);
      const user = userCredential.user;

      const selectedOffice = offices.find(o => o.id === staffOffice);

      // Build full name
      const middleInitial = staffMiddleName ? staffMiddleName.charAt(0).toUpperCase() + '.' : '';
      const fullName = `${staffFirstName} ${middleInitial} ${staffLastName}${staffSuffix ? ' ' + staffSuffix : ''}`.replace(/\s+/g, ' ').trim();

      // Save staff data to Firestore
      await addDoc(collection(db, 'staff'), {
        uid: user.uid,
        firstName: staffFirstName.trim(),
        lastName: staffLastName.trim(),
        middleName: staffMiddleName.trim(),
        middleInitial: staffMiddleName ? staffMiddleName.charAt(0).toUpperCase() : '',
        suffix: staffSuffix.trim(),
        name: fullName,
        fullName: fullName,
        email: staffEmail.trim(),
        username: staffUsername.trim(),
        office: selectedOffice.name,
        officeId: staffOffice,
        role: 'staff',
        createdAt: serverTimestamp(),
        isActive: true
      });

      // Send credentials via email
      try {
        const apiUrl = process.env.NODE_ENV === 'production'
          ? '/api/send-staff-email'
          : 'http://localhost:5000/api/send-staff-credentials';
          
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: staffEmail.trim(),
            staffName: fullName,
            username: staffUsername.trim(),
            password: password,
            office: selectedOffice.name
          })
        });

        const result = await response.json();
        
        if (result.success) {
          console.log('✅ Email sent successfully to:', staffEmail);
        } else {
          throw new Error(result.error || 'Failed to send email');
        }
      } catch (emailError) {
        console.error('❌ Failed to send email:', emailError);
        // Continue anyway - account was created successfully
        alert('Account created but email failed to send. Please manually share credentials with staff:\nUsername: ' + staffUsername + '\nPassword: ' + password);
      }

      // Reload staff list
      await loadStaff();

      // Show success message
      setCreatedStaff({
        name: fullName,
        email: staffEmail.trim(),
        username: staffUsername.trim(),
        office: selectedOffice.name
      });
      setShowSuccessModal(true);
      setShowCreateForm(false);
      setStaffFirstName('');
      setStaffLastName('');
      setStaffMiddleName('');
      setStaffSuffix('');
      setStaffEmail('');
      setStaffUsername('');
      setLoading(false);

    } catch (error) {
      console.error('Error creating staff:', error);
      if (error.code === 'auth/email-already-in-use') {
        setError('Email address is already in use');
      } else if (error.code === 'auth/invalid-email') {
        setError('Invalid email address');
      } else if (error.code === 'auth/weak-password') {
        setError('Password is too weak');
      } else {
        setError('Failed to create staff account: ' + error.message);
      }
      setLoading(false);
    }
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
    const target = selectedStudent || selectedStaff;
    const isStudent = !!selectedStudent;
    const collectionName = isStudent ? 'students' : 'staff';
    
    if (!target) return;

    try {
      if (confirmAction === 'suspend') {
        // Toggle suspension status
        const newStatus = !target.isActive;
        await updateDoc(doc(db, collectionName, target.firestoreId), {
          isActive: newStatus
        });
        if (isStudent) {
          await loadStudents();
        } else {
          await loadStaff();
        }
        alert(`Account ${newStatus ? 'activated' : 'suspended'} successfully!`);
      } else if (confirmAction === 'delete') {
        // Delete from Firestore
        // Note: User will remain in Firebase Auth but cannot login without Firestore document
        await deleteDoc(doc(db, collectionName, target.firestoreId));
        if (isStudent) {
          await loadStudents();
        } else {
          await loadStaff();
        }
        alert('Account deleted successfully from database!');
      }
      setShowConfirmModal(false);
      setSelectedStudent(null);
      setSelectedStaff(null);
      setConfirmAction(null);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to perform action: ' + error.message);
    }
  };

  const cancelConfirm = () => {
    setShowConfirmModal(false);
    setSelectedStudent(null);
    setSelectedStaff(null);
    setConfirmAction(null);
  };

  return (
    <div className="superadmin-page user-management-container">
      <div className="page-header">
        <div>
          <h1 className="user-management-title">User Management</h1>
          <p className="page-subtitle">Create, suspend, or remove student and staff accounts</p>
        </div>
        <div className="header-actions">
          <button className="btn-primary create-student-btn" onClick={activeTab === 'students' ? handleNewStudent : handleNewStaff}>
            <FaUserPlus aria-hidden="true" />
            {activeTab === 'students' ? 'Create Student Account' : 'Create Staff Account'}
          </button>
          <NotificationBell />
        </div>
      </div>

      {/* Tabs + search */}
      <div className="user-tabs-row">
        <div className="user-tabs">
          <button
            className={`user-tab ${activeTab === 'students' ? 'active' : ''}`}
            onClick={() => { setActiveTab('students'); resetPagination(); }}
          >
            Students
          </button>
          <button
            className={`user-tab ${activeTab === 'staff' ? 'active' : ''}`}
            onClick={() => { setActiveTab('staff'); resetPagination(); }}
          >
            Staff Members
          </button>
        </div>

        <div className="search-bar">
          <FaSearch className="search-icon" aria-hidden="true" />
          <input
            type="search"
            name="account-search"
            placeholder={activeTab === 'students' ? 'Search students...' : 'Search staff...'}
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); resetPagination(); }}
            aria-label="Search accounts"
          />
        </div>
      </div>

      {showConfirmModal && (selectedStudent || selectedStaff) && (
        <div className="create-student-modal">
          <div className="modal-content confirm-modal">
            <FaBan className="confirm-icon" />
            <h2 className="confirm-title">
              {confirmAction === 'suspend' 
                ? ((selectedStudent?.isActive || selectedStaff?.isActive) ? 'Suspend Account?' : 'Activate Account?')
                : 'Delete Account?'}
            </h2>
            <p className="confirm-message">
              {confirmAction === 'suspend' 
                ? ((selectedStudent?.isActive || selectedStaff?.isActive)
                    ? `Are you sure you want to suspend ${(selectedStudent || selectedStaff).name}'s account? They will not be able to log in until reactivated.`
                    : `Are you sure you want to activate ${(selectedStudent || selectedStaff).name}'s account? They will be able to log in again.`)
                : `Are you sure you want to permanently delete ${(selectedStudent || selectedStaff).name}'s account? This action cannot be undone.`}
            </p>
            <div className="student-info-box">
              {selectedStudent ? (
                <>
                  <p><strong>Student ID:</strong> {selectedStudent.id}</p>
                  <p><strong>Name:</strong> {selectedStudent.name}</p>
                  <p><strong>Email:</strong> {selectedStudent.email}</p>
                </>
              ) : (
                <>
                  <p><strong>Name:</strong> {selectedStaff.name}</p>
                  <p><strong>Email:</strong> {selectedStaff.email}</p>
                  <p><strong>Office:</strong> {selectedStaff.office}</p>
                </>
              )}
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
                  ? ((selectedStudent?.isActive || selectedStaff?.isActive) ? 'Suspend' : 'Activate')
                  : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccessModal && (createdStudent || createdStaff) && (
        <div className="create-student-modal">
          <div className="modal-content success-modal">
            <div className="success-header">
              <FaCheck className="success-icon" />
              <h2 className="success-title">Account Created Successfully!</h2>
            </div>
            
            <p className="success-message">
              The {createdStudent ? 'student' : 'staff'} account has been created and login credentials have been sent to the email address.
            </p>

            <div className="credentials-box">
              {createdStudent ? (
                <>
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
                </>
              ) : (
                <>
                  <div className="credential-row">
                    <label className="credential-label">Full Name:</label>
                    <span className="credential-value">{createdStaff.name}</span>
                  </div>
                  
                  <div className="credential-row">
                    <label className="credential-label">Username:</label>
                    <span className="credential-value">{createdStaff.username}</span>
                  </div>
                  
                  <div className="credential-row">
                    <label className="credential-label">Office:</label>
                    <span className="credential-value">{createdStaff.office}</span>
                  </div>
                  
                  <div className="credential-row">
                    <label className="credential-label">Email Sent To:</label>
                    <span className="credential-value">{createdStaff.email}</span>
                  </div>
                </>
              )}
            </div>

            <div className="success-warning">
              <FaEnvelope className="warning-icon" />
              <p>The {createdStudent ? 'student' : 'staff member'} should receive an email with their login credentials shortly. Please ask them to check their inbox (and spam folder).</p>
            </div>

            <div className="modal-actions">
              <button className="success-close-btn" onClick={handleCloseSuccessModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showCreateForm && activeTab === 'students' && (
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

              <div className="form-row-super">
                <div className="form-group-super">
                  <label className="form-label-super">First Name *</label>
                  <input
                    type="text"
                    className="form-input-super"
                    value={studentFirstName}
                    onChange={(e) => setStudentFirstName(e.target.value)}
                    placeholder="First name"
                    required
                  />
                </div>

                <div className="form-group-super">
                  <label className="form-label-super">Last Name *</label>
                  <input
                    type="text"
                    className="form-input-super"
                    value={studentLastName}
                    onChange={(e) => setStudentLastName(e.target.value)}
                    placeholder="Last name"
                    required
                  />
                </div>
              </div>

              <div className="form-row-super">
                <div className="form-group-super">
                  <label className="form-label-super">Middle Name</label>
                  <input
                    type="text"
                    className="form-input-super"
                    value={studentMiddleName}
                    onChange={(e) => setStudentMiddleName(e.target.value)}
                    placeholder="Middle name (optional)"
                  />
                </div>

                <div className="form-group-super small-input">
                  <label className="form-label-super">Suffix</label>
                  <input
                    type="text"
                    className="form-input-super"
                    value={studentSuffix}
                    onChange={(e) => setStudentSuffix(e.target.value)}
                    placeholder="Jr, Sr, III"
                    maxLength="10"
                  />
                </div>
              </div>

              <div className="form-row-super">
                <div className="form-group-super">
                  <label className="form-label-super">Grade Level *</label>
                  <select
                    className="form-input-super"
                    value={studentGradeLevel}
                    onChange={(e) => setStudentGradeLevel(e.target.value)}
                    required
                  >
                    <option value="">Select grade level</option>
                    <option value="Grade 7">Grade 7</option>
                    <option value="Grade 8">Grade 8</option>
                    <option value="Grade 9">Grade 9</option>
                    <option value="Grade 10">Grade 10</option>
                    <option value="Grade 11">Grade 11</option>
                    <option value="Grade 12">Grade 12</option>
                  </select>
                </div>

                <div className="form-group-super">
                  <label className="form-label-super">Section *</label>
                  <input
                    type="text"
                    className="form-input-super"
                    value={studentSection}
                    onChange={(e) => setStudentSection(e.target.value)}
                    placeholder="e.g., Einstein, Newton"
                    required
                  />
                </div>
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

      {showCreateForm && activeTab === 'staff' && (
        <div className="create-student-modal">
          <div className="modal-content">
            <h2 className="modal-title">Create New Staff Account</h2>
            <p className="modal-subtitle">Enter staff information to generate account credentials</p>

            {error && (
              <div className="error-message-super">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateStaff} className="create-student-form">
              <div className="form-row-super">
                <div className="form-group-super">
                  <label className="form-label-super">First Name *</label>
                  <input
                    type="text"
                    className="form-input-super"
                    value={staffFirstName}
                    onChange={(e) => setStaffFirstName(e.target.value)}
                    placeholder="First name"
                    required
                  />
                </div>

                <div className="form-group-super">
                  <label className="form-label-super">Last Name *</label>
                  <input
                    type="text"
                    className="form-input-super"
                    value={staffLastName}
                    onChange={(e) => setStaffLastName(e.target.value)}
                    placeholder="Last name"
                    required
                  />
                </div>
              </div>

              <div className="form-row-super">
                <div className="form-group-super">
                  <label className="form-label-super">Middle Name</label>
                  <input
                    type="text"
                    className="form-input-super"
                    value={staffMiddleName}
                    onChange={(e) => setStaffMiddleName(e.target.value)}
                    placeholder="Middle name (optional)"
                  />
                </div>

                <div className="form-group-super small-input">
                  <label className="form-label-super">Suffix</label>
                  <input
                    type="text"
                    className="form-input-super"
                    value={staffSuffix}
                    onChange={(e) => setStaffSuffix(e.target.value)}
                    placeholder="Jr, Sr, III"
                    maxLength="10"
                  />
                </div>
              </div>

              <div className="form-group-super">
                <label className="form-label-super">Email Address</label>
                <input
                  type="email"
                  className="form-input-super"
                  value={staffEmail}
                  onChange={(e) => setStaffEmail(e.target.value)}
                  placeholder="staff@asj.edu"
                  required
                />
              </div>

              <div className="form-group-super">
                <label className="form-label-super">Username</label>
                <input
                  type="text"
                  className="form-input-super"
                  value={staffUsername}
                  onChange={(e) => setStaffUsername(e.target.value)}
                  placeholder="Enter username for login"
                  required
                />
              </div>

              <div className="form-group-super">
                <label className="form-label-super">Assign to Office</label>
                <select
                  className="form-input-super"
                  value={staffOffice}
                  onChange={(e) => setStaffOffice(e.target.value)}
                  required
                >
                  {offices.map((office) => (
                    <option key={office.id} value={office.id}>
                      {office.name}
                    </option>
                  ))}
                </select>
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

      {activeTab === 'students' ? (
        <div className="card students-list-section">
          <h2 className="section-title-super">Student Accounts</h2>
          {visibleStudents.pageItems.length === 0 ? (
            <div className="empty-state">
              <FaSearch className="empty-state-icon" aria-hidden="true" />
              <p>{students.length === 0 ? 'No student accounts yet. Click "Create Student Account" to add one.' : 'No students match your search.'}</p>
            </div>
          ) : (
            <>
              <div className="table-container">
                <div className="students-table">
                  <div className="table-header">
                    <div className="table-cell">Student ID</div>
                    <div className="table-cell">Name</div>
                    <div className="table-cell">Email</div>
                    <div className="table-cell">Created</div>
                    <div className="table-cell">Actions</div>
                  </div>
                  {visibleStudents.pageItems.map((student) => (
                    <div key={student.firestoreId || student.id} className="table-row">
                      <div className="table-cell">{student.id}</div>
                      <div className="table-cell">
                        {student.name}
                        {!student.isActive && <span className="status status-suspended">Suspended</span>}
                      </div>
                      <div className="table-cell">{student.email}</div>
                      <div className="table-cell">{student.createdAt}</div>
                      <div className="table-cell">
                        <button
                          className="table-action-btn reset"
                          onClick={() => handleSuspendStudent(student)}
                        >
                          <FaBan aria-hidden="true" />
                          {student.isActive ? 'Suspend' : 'Activate'}
                        </button>
                        <button
                          className="table-action-btn delete"
                          onClick={() => handleDeleteStudent(student)}
                        >
                          <FaKey aria-hidden="true" />
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="pagination">
                <span className="pagination-info">
                  Showing {filterList(students).length} student{filterList(students).length === 1 ? '' : 's'}
                </span>
                {visibleStudents.totalPages > 1 && (
                  <>
                    <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} aria-label="Previous page">
                      ‹
                    </button>
                    {Array.from({ length: visibleStudents.totalPages }, (_, i) => i + 1).map((pg) => (
                      <button
                        key={pg}
                        className={currentPage === pg ? 'active' : ''}
                        onClick={() => setCurrentPage(pg)}
                        aria-label={`Page ${pg}`}
                        aria-current={currentPage === pg ? 'page' : undefined}
                      >
                        {pg}
                      </button>
                    ))}
                    <button onClick={() => setCurrentPage((p) => Math.min(visibleStudents.totalPages, p + 1))} disabled={currentPage === visibleStudents.totalPages} aria-label="Next page">
                      ›
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="card students-list-section">
          <h2 className="section-title-super">Staff Accounts</h2>
          {visibleStaff.pageItems.length === 0 ? (
            <div className="empty-state">
              <FaSearch className="empty-state-icon" aria-hidden="true" />
              <p>{staffMembers.length === 0 ? 'No staff accounts yet. Click "Create Staff Account" to add one.' : 'No staff match your search.'}</p>
            </div>
          ) : (
            <>
              <div className="table-container">
                <div className="students-table staff-table">
                  <div className="table-header">
                    <div className="table-cell">Name</div>
                    <div className="table-cell">Email</div>
                    <div className="table-cell">Username</div>
                    <div className="table-cell">Office</div>
                    <div className="table-cell">Created</div>
                    <div className="table-cell">Actions</div>
                  </div>
                  {visibleStaff.pageItems.map((staff) => (
                    <div key={staff.firestoreId} className="table-row">
                      <div className="table-cell">
                        {staff.name}
                        {!staff.isActive && <span className="status status-suspended">Suspended</span>}
                      </div>
                      <div className="table-cell">{staff.email}</div>
                      <div className="table-cell">{staff.username}</div>
                      <div className="table-cell">{staff.office}</div>
                      <div className="table-cell">{staff.createdAt}</div>
                      <div className="table-cell">
                        <button
                          className="table-action-btn reset"
                          onClick={() => {
                            setSelectedStaff(staff);
                            setConfirmAction('suspend');
                            setShowConfirmModal(true);
                          }}
                        >
                          <FaBan aria-hidden="true" />
                          {staff.isActive ? 'Suspend' : 'Activate'}
                        </button>
                        <button
                          className="table-action-btn delete"
                          onClick={() => {
                            setSelectedStaff(staff);
                            setConfirmAction('delete');
                            setShowConfirmModal(true);
                          }}
                        >
                          <FaKey aria-hidden="true" />
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="pagination">
                <span className="pagination-info">
                  Showing {filterList(staffMembers).length} staff member{filterList(staffMembers).length === 1 ? '' : 's'}
                </span>
                {visibleStaff.totalPages > 1 && (
                  <>
                    <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} aria-label="Previous page">
                      ‹
                    </button>
                    {Array.from({ length: visibleStaff.totalPages }, (_, i) => i + 1).map((pg) => (
                      <button
                        key={pg}
                        className={currentPage === pg ? 'active' : ''}
                        onClick={() => setCurrentPage(pg)}
                        aria-label={`Page ${pg}`}
                        aria-current={currentPage === pg ? 'page' : undefined}
                      >
                        {pg}
                      </button>
                    ))}
                    <button onClick={() => setCurrentPage((p) => Math.min(visibleStaff.totalPages, p + 1))} disabled={currentPage === visibleStaff.totalPages} aria-label="Next page">
                      ›
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default UserManagement;
