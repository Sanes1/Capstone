import React from 'react';
import { FaUserCircle } from 'react-icons/fa';
import '../styles/Header.css';

function Header() {
  return (
    <header className="top-header">
      <div className="header-left">
        <img src="https://via.placeholder.com/50" alt="Logo" />
        <h2>Academia De San Jose</h2>
      </div>
      <div className="header-right">
        <div className="user-profile">
          <div className="user-text">
            <span className="user-name">Ricky Liam</span>
            <span className="student-id">Student ID: 05-2324-000000</span>
          </div>
          <div className="avatar">
            <FaUserCircle />
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
