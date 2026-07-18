import React, { useState } from 'react';
import { FaQrcode, FaUserCircle, FaShieldAlt } from 'react-icons/fa';
import '../styles/Login.css';

const Login = ({ onLogin, onGuestLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberDevice, setRememberDevice] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // For now, just proceed to dashboard (authentication will be added later with Firebase)
    if (username && password) {
      onLogin();
    } else {
      alert('Please enter username and password');
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
              <div className="form-group-student">
                <label className="form-label-student">Username/ Student ID</label>
                <input
                  type="text"
                  className="form-input-student"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username or student ID"
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

              <button type="submit" className="sign-in-btn-student">
                Sign In
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
