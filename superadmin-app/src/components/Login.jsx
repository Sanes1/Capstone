import React, { useState } from 'react';
import { FaDollarSign, FaBook, FaUsers, FaClipboardList, FaShieldAlt } from 'react-icons/fa';
import '../styles/Login.css';

const Login = ({ onLogin }) => {
  const [selectedDepartment, setSelectedDepartment] = useState('finance');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const departments = [
    { id: 'finance', name: 'Finance', icon: FaDollarSign },
    { id: 'library', name: 'Library', icon: FaBook },
    { id: 'guidance', name: 'Guidance Office', icon: FaUsers },
    { id: 'registrar', name: 'Registrar', icon: FaClipboardList }
  ];

  const handleSignIn = (e) => {
    e.preventDefault();
    // Static login - just navigate to dashboard
    onLogin();
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <img 
          src="/school-background.jpg" 
          alt="School Background" 
          className="login-bg-image"
          onError={(e) => { e.target.style.display = 'none'; }}
        />
        <img 
          src="/school-logo.png" 
          alt="School Logo" 
          className="school-logo-large"
          onError={(e) => { e.target.style.display = 'none'; }}
        />
      </div>
      
      <div className="login-right">
        <div className="login-form-container">
          <div className="login-header">
            <h1 className="login-title">Welcome Back</h1>
            <p className="login-subtitle">Please enter your credentials to continue.</p>
          </div>
          
          <form onSubmit={handleSignIn}>
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
                    >
                      <Icon className="department-icon" />
                      <span>{dept.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                type="text"
                className="form-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
              />
            </div>
            
            <div className="form-group">
              <div className="password-label-row">
                <label className="form-label">Password</label>
                <a href="#" className="forgot-password">Forgot Password?</a>
              </div>
              <input
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
              />
            </div>
            
            <div className="remember-section">
              <input
                type="checkbox"
                id="remember"
                className="remember-checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label htmlFor="remember" className="remember-label">
                Remember this session for 8 hours
              </label>
            </div>
            
            <button type="submit" className="sign-in-button">
              Sign In
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
  );
};

export default Login;
