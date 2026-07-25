import React, { useState } from 'react';
import { FaQrcode, FaUserCircle, FaShieldAlt } from 'react-icons/fa';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import '../styles/Login.css';

const Login = ({ onLogin, onGuestLogin }) => {
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [rememberDevice, setRememberDevice] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleStudentIdChange = (e) => {
    const value = e.target.value;
    // Only allow digits and max 4 characters
    if (/^\d{0,4}$/.test(value)) {
      setStudentId(value);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate student ID is exactly 4 digits
      if (!studentId || studentId.length !== 4) {
        setError('Student ID must be exactly 4 digits');
        setLoading(false);
        return;
      }

      if (!password) {
        setError('Please enter your password');
        setLoading(false);
        return;
      }

      // Find student by Student ID in Firestore (check both 'id' and 'studentId' fields)
      const studentsRef = collection(db, 'students');
      let q = query(studentsRef, where('id', '==', studentId));
      let querySnapshot = await getDocs(q);

      // If not found by 'id', try 'studentId' field
      if (querySnapshot.empty) {
        q = query(studentsRef, where('studentId', '==', studentId));
        querySnapshot = await getDocs(q);
      }

      // If still not found, try with full format XX-XXXX-XXXXXX
      if (querySnapshot.empty) {
        const fullIdPattern = studentId.padStart(4, '0');
        q = query(studentsRef, where('studentId', '==', `05-2324-${fullIdPattern}`));
        querySnapshot = await getDocs(q);
      }

      if (querySnapshot.empty) {
        setError('Invalid Student ID or password');
        setLoading(false);
        return;
      }

      // Get student data
      const studentDoc = querySnapshot.docs[0];
      const studentData = studentDoc.data();
      const firestoreDocId = studentDoc.id; // Save the Firestore document ID
      
      console.log('📋 Raw student data from Firestore:', studentData);
      console.log('📌 Firestore document ID:', firestoreDocId);

      // Check if account is active
      if (studentData.isActive === false) {
        setError('Your account has been suspended. Please contact administration.');
        setLoading(false);
        return;
      }

      // Sign in with Firebase Authentication using email and password
      await signInWithEmailAndPassword(auth, studentData.email, password);

      // Prepare student data for localStorage - handle both new and legacy formats
      const formattedStudentData = {
        firestoreDocId: firestoreDocId, // Store the actual Firestore document ID
        uid: studentData.uid || auth.currentUser.uid,
        studentId: studentData.studentId || studentData.id || studentId,
        id: studentData.id || studentId, // Keep legacy 'id' field for compatibility
        firstName: studentData.firstName || studentData.name?.split(' ')[0] || '',
        lastName: studentData.lastName || studentData.name?.split(' ').slice(1).join(' ') || '',
        middleName: studentData.middleName || '',
        suffix: studentData.suffix || '',
        email: studentData.email,
        name: studentData.name || `${studentData.firstName || ''} ${studentData.lastName || ''}`.trim(),
        gradeLevel: studentData.gradeLevel || '',
        section: studentData.section || '',
        phoneNumber: studentData.phoneNumber || '',
        profilePicture: studentData.profilePicture || '',
        twoFactorEnabled: studentData.twoFactorEnabled || false
      };
      
      console.log('✅ Formatted student data for localStorage:', formattedStudentData);
      
      // Save student data to localStorage with all fields
      localStorage.setItem('studentData', JSON.stringify(formattedStudentData));

      // Login successful
      onLogin();
      setLoading(false);

    } catch (error) {
      console.error('Login error:', error);
      
      if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
        setError('Invalid Student ID or password');
      } else if (error.code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please try again later.');
      } else if (error.code === 'auth/invalid-credential') {
        setError('Invalid Student ID or password');
      } else {
        setError('Login failed. Please try again.');
      }
      setLoading(false);
    }
  };

  const handleQRLogin = () => {
    alert('QR Code login feature coming soon!');
  };

  const handleGuestLogin = () => {
    onGuestLogin();
  };

  return (
    <div className="login-container-student">
      <div className="login-split-view">
        <div className="login-left-section">
          <div className="school-background-overlay">
            <div className="overlay-pattern"></div>
          </div>
        </div>

        <div className="login-right-section">
          <div className="login-form-card">
            <h1 className="login-welcome-title">Welcome Back</h1>
            <p className="login-subtitle">Please enter your credentials to access your account.</p>

            <form onSubmit={handleSubmit} className="login-form-student">
              {error && (
                <div className="error-message-student">
                  {error}
                </div>
              )}

              <div className="form-group-student">
                <label className="form-label-student">Student ID</label>
                <input
                  type="text"
                  className="form-input-student"
                  value={studentId}
                  onChange={handleStudentIdChange}
                  placeholder="Enter your 4-digit student ID"
                  maxLength="4"
                  pattern="\d{4}"
                />
              </div>

              <div className="form-group-student">
                <div className="label-row">
                  <label className="form-label-student">Password</label>
                  <a href="#" className="forgot-password-link">Forget Password?</a>
                </div>
                <input
                  type="password"
                  className="form-input-student"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                />
              </div>

              <div className="remember-device-row">
                <input
                  type="checkbox"
                  id="rememberDevice"
                  checked={rememberDevice}
                  onChange={(e) => setRememberDevice(e.target.checked)}
                  className="remember-checkbox"
                />
                <label htmlFor="rememberDevice" className="remember-label">
                  Remember this device
                </label>
              </div>

              <button type="submit" className="sign-in-btn-student" disabled={loading}>
                {loading ? 'Signing In...' : 'Sign In'}
              </button>

              <div className="divider-student">
                <span>or</span>
              </div>

              <button type="button" className="alt-login-btn" onClick={handleQRLogin}>
                <FaQrcode />
                Login with QR code
              </button>

              <button type="button" className="alt-login-btn" onClick={handleGuestLogin}>
                <FaUserCircle />
                Continue as Guest
              </button>

              <p className="contact-admissions">
                New student? <a href="#" className="contact-link">Contact Admissions</a>
              </p>

              <div className="secure-badge">
                <FaShieldAlt className="shield-icon" />
                <span>Secure-bit Connection Verified</span>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
