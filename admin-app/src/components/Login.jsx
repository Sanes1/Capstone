import React, { useState } from 'react';
import { FaDollarSign, FaBook, FaUsers, FaClipboardList, FaShieldAlt, FaEye, FaEyeSlash } from 'react-icons/fa';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebase';
import '../styles/Login.css';

const Login = ({ onLogin }) => {
  const [selectedDepartment, setSelectedDepartment] = useState('finance');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const departments = [
    { id: 'finance', name: 'Finance', icon: FaDollarSign },
    { id: 'library', name: 'Library', icon: FaBook },
    { id: 'guidance', name: 'Guidance', icon: FaUsers },
    { id: 'registrar', name: 'Registrar', icon: FaClipboardList }
  ];

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    // Validation
    if (!username.trim()) {
      setError('Please enter your username');
      setLoading(false);
      return;
    }

    if (!password.trim()) {
      setError('Please enter your password');
      setLoading(false);
      return;
    }
    
    try {
      // First, find the staff member by username and office
      const staffQuery = query(
        collection(db, 'staff'),
        where('username', '==', username.trim()),
        where('officeId', '==', selectedDepartment)
      );
      
      const querySnapshot = await getDocs(staffQuery);
      
      if (querySnapshot.empty) {
        setError('Invalid username or office. Please check your credentials.');
        setLoading(false);
        return;
      }

      const staffDoc = querySnapshot.docs[0];
      const staffData = staffDoc.data();

      // Check if staff is active
      if (!staffData.isActive) {
        setError('Your account has been suspended. Please contact the administrator.');
        setLoading(false);
        return;
      }

      // Authenticate with Firebase using email and password
      await signInWithEmailAndPassword(auth, staffData.email, password);

      // Store staff info in localStorage
      const staffInfo = {
        name: staffData.name,
        fullName: staffData.name, // Save as fullName for compatibility
        firstName: staffData.firstName || '',
        lastName: staffData.lastName || '',
        email: staffData.email,
        username: staffData.username,
        office: staffData.office,
        officeId: staffData.officeId,
        position: staffData.position || '',
        staffId: staffData.staffId || '',
        phoneNumber: staffData.phoneNumber || '',
        profilePicture: staffData.profilePicture || '',
        uid: staffData.uid,
        firestoreDocId: staffDoc.id // Save the document ID
      };
      
      localStorage.setItem('staffData', JSON.stringify(staffInfo));
      
      console.log('✅ Staff logged in:', staffData.name);
      onLogin(staffData.office);
      
    } catch (error) {
      console.error('❌ Login error:', error);
      
      if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        setError('Invalid password. Please try again.');
      } else if (error.code === 'auth/user-not-found') {
        setError('Staff account not found.');
      } else if (error.code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please try again later.');
      } else {
        setError('Login failed. Please check your credentials and try again.');
      }
      
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div
        className="login-bg-photo"
        style={{ backgroundImage: "url('/school-cover.jpg')" }}
        aria-hidden="true"
      ></div>
      <div className="login-card">
        <div className="login-left">
          <img
            src="/school-logo.jpg"
            alt="Academia De San Jose school logo"
            className="school-logo-large"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        </div>
        
        <div className="login-right">
          <div className="login-form-container">
          <div className="login-header">
            <h1 className="login-title">Welcome Back</h1>
            <p className="login-subtitle">Please enter your credentials to continue.</p>
          </div>
          
          <form onSubmit={handleSignIn}>
            {error && (
              <div className="error-message" style={{
                backgroundColor: '#fee',
                border: '1px solid #fcc',
                color: '#c33',
                padding: '12px 18px',
                borderRadius: '8px',
                marginBottom: '20px',
                fontSize: '14px'
              }}>
                {error}
              </div>
            )}
            
            <div className="department-section">
              <label className="section-label">Administrative Department</label>
              <div className="department-grid">
                {departments.map((dept) => {
                  const Icon = dept.icon;
                  return (
                    <button
                      key={dept.id}
                      type="button"
                      className={`department-button ${selectedDepartment === dept.id ? 'selected' : ''}`}
                      onClick={() => setSelectedDepartment(dept.id)}
                      disabled={loading}
                    >
                      <Icon className="department-icon" />
                      <span>{dept.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label" htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                className="form-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                autoComplete="username"
                required
                disabled={loading}
              />
            </div>
            
            <div className="form-group">
              <div className="password-label-row">
                <label className="form-label" htmlFor="password">Password</label>
                <a href="#" className="forgot-password">Forgot Password?</a>
              </div>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  className="form-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
            
            <div className="remember-section">
              <input
                type="checkbox"
                id="remember"
                className="remember-checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={loading}
              />
              <label htmlFor="remember" className="remember-label">
                Remember this session for 8 hours
              </label>
            </div>
            
            <button type="submit" className="sign-in-button" disabled={loading}>
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
            
            <div className="support-section">
              <p className="support-text">
                Need Assistance? <a href="#" className="support-link">Contact IT Support</a>
              </p>
            </div>
            
            <div className="secure-badge">
              <FaShieldAlt className="secure-icon" />
              <p className="secure-text">Encrypted Secure Connection</p>
            </div>
          </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
