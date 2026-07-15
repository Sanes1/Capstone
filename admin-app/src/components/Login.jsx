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
    // Static login - pass the selected department
    const deptNames = {
      'finance': 'Finance',
      'library': 'Library',
      'guidance': 'Guidance Office',
      'registrar': 'Registrar'
    };
    onLogin(deptNames[selectedDepartment]);
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-bg-image" style={{
          backgroundImage: 'url(data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCADIAMgDASIAAhEBAxEB/8QAGwAAAgMBAQEAAAAAAAAAAAAAAAECAwQFBgf/xAA0EAACAQQABAQFAwQCAwEAAAABAgADEQQSITFBUWEFEyJxMoGRobHB0fBC4fEUI1IVM2L/xAAZAQEBAQEBAQAAAAAAAAAAAAAAAQIDBAX/xAAiEQEBAQEAAgICAwEBAAAAAAAAARECAyExBBJBURMiYXH/2gAMAwEAAhEDEQA/APeYBBCAMIQgBCEIAQhCAEIQgBCEJR4DQhCATt4EIQPCSUaTQhKPRE6UmRJCA2QEJICA2RZIxJKARMiZEzSCJhGIwMJJkTEyCvEyJAkzSCpmZEkySYHJiZmRMkyCGZMQMyRUiZkTMyQkySQkoxJhpEzSEhJEkTJJEZMlEZgZpIjEYiRMQmZomQhCISZJJJMk9BcZjkzPE6V1AyYkoSvWiBhAdSTBhFpTUIiQdqpOmiiROitBUEaKoMoq06glJF8SWlFq5ErJ3MhNJmRMiyEkTASQMggZMGQkpAM0mISMlJJGJJCSSSYSKZE0mQlgdkSZM0kQeiyYm6KBTE6UiZBOUSaRIpHVJE11GgmzKuakSZJF0sCoaTJkjINKGmijOirGiaMqIYTJNoFONT6pQ0U0oQ0nfaQ0AwZCQM0AzQc6ZJJEykiQZUgJEmEkJGSJkIzINt7Svi/8Aq0vn1SzVPTTTlEh4PVB91TzK3t/aPxJeOXT9YBCTq03ouyNuSOdtEOVbqBJRgSaHbRlZjwlbjaaQUiREGlBJHQ1JNLUwMmQrqWUtJ1agUEnUmvRu2pV5mGlqOGpuG7ow/qAmkJVqsCBr3Mp8Q8NOSmqJq/XYg/8ADu0u66Y/kjdcYGJkv/icip/8jz++pWR+gll+rg/GftzpO2p0VxqK6FFVfgZ36t7faTp+C0FOmFz6sbQHhNr17P+HH/snr+d6h8f+v3+vPy6Z61OlrSUlv7/ue09dT8Kw0+T60++Z/wDYrjQKoB6KNo/hqV8Xt+f57+n+/wDv/r3eSC8FzCZaVP8AzP8Ap/Xz/kfv18n5M08fE6b9S+jfQj0P5nc2vTHPvx1TTXO7bvTVJX/VTUgQpUtqD/T/AK/tz/n08z5Pl9q8r+MQm7EyBUpq/KaqFQLUVukxYsWW3Ht93Ppqy+O59SWCEJTkzRHJk01eAjBAoMsSkOW0NJxBsSKj8OoZTVQoSC1xBdS6+x+q8SsapQJNR1pgEsTQy1GK1VY/CNbJlzA1+ZYi2oPXQP0HaMBPaE6RjiEkRIgyQmSKv0mTUj/1T+f+S+nQZ+Q07aHRR7/PaU0KbO4VRf69AJJcirTYJUUqehTY11PW/I/CY+VYa9k/4Rv9sD91xaS2UXY+o3Y7P26TZSwqND/5AA91X+xm/DwKFRb06YU/sT7nbfUmaUweGprUqEdPUdj7aTj5fqx+fi9Y+2H/AIlAfy/PQOoUnfLjq24vr6y7+fz+n5vk82p06CJsoqJe+wtmPubyboBxH6TLj/NaaxlMhyVbgHPrIH1A/sGG/eT/AHUEuGIP+f0T/wC66vtzzmvlvzZP5ZH/AHH55dvLr07X/H+U/j+3e06b11Nq16S20f619u3oN/zv+fl5f/0z+fw+vD+bn+3z69WXG/T+fnvx1+V/4hm08RdA1V+X7LfJm/2L9Z5L/rj+efP/ABt/dP8A0TLLxn/j+f1/t4fDz9Z9D80iujAnht/t8x/y6fb5fy8/Z4/qvg/X+f8A3p/d+S65qUamIyLVV+otob69ukr89TwFz+7v+5nu8TEHhQYf1Mp/vP2m8YFP0ljc77/9v/n+Z6P5Pj+1eW/k/j+d+Lh+f+z6Z8pM+cV8dKTVV87l2q+kAg3H8kOsX/TWJJJ0STqxvrt++p6+Xx5m/H5bqPD/ACoiAiwFh7TTgsT5isbFsXPy4THgowNiPhta35m7Bpr/ANSnYpU3OfTfkk37Tn8l+/1e34v1/qX8fDX5Z3z/AJ+Wx/S/L8/9zFOb0uKjrb0U6gY+1z/9/wAfr/f/ABv/AO/fy/uf+XOv+zv9F+v9+Xg/7E++nVvxP3/D+3p2/P8Afz+v9X+/99Pzv/OX+Xn4vr9ut8vkeb/5af6f/M/j8/z+O/7f3/7P5dP29WpxcR2JLupHYAE8PnxmQjr/ADuvv/Nfux/P2/P5+S+3LTy0yn+f06f4f8xf5/8A5YQhCYdhCEBoiEIQBCEIAhCJdl2byuR1A3z+e+3+IBCEJMnzP+b/AJ7/AGgEIQgCEIQBCEIAQhCAIQhAEIQgCEIQBJCPHU1KytbTDjbkOhkIAhCESCK1V1LArYWJN9sOQ+/4hCB//9k=)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}></div>
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
