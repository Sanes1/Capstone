import React from 'react';
import { FaThLarge, FaEdit, FaChartLine, FaUsers, FaUserCircle } from 'react-icons/fa';
import '../styles/SuperAdminSidebar.css';

const SuperAdminSidebar = ({ activePage, onNavigate }) => {
  return (
    <aside className="superadmin-sidebar">
      <div className="sidebar-logo">
        <img src="/school-logo.png" alt="School Logo" />
      </div>
      
      <nav className="sidebar-menu">
        <div
          className={`sidebar-item ${activePage === 'dashboard' ? 'active' : ''}`}
          onClick={() => onNavigate('dashboard')}
        >
          <FaThLarge className="sidebar-icon" />
          <span className="sidebar-label">Dashboard</span>
        </div>
        
        <div
          className={`sidebar-item ${activePage === 'edit-request' ? 'active' : ''}`}
          onClick={() => onNavigate('edit-request')}
        >
          <FaEdit className="sidebar-icon" />
          <span className="sidebar-label">Edit Request Form</span>
        </div>
        
        <div
          className={`sidebar-item ${activePage === 'analytics' ? 'active' : ''}`}
          onClick={() => onNavigate('analytics')}
        >
          <FaChartLine className="sidebar-icon" />
          <span className="sidebar-label">Analytics</span>
        </div>
        
        <div
          className={`sidebar-item ${activePage === 'user-management' ? 'active' : ''}`}
          onClick={() => onNavigate('user-management')}
        >
          <FaUsers className="sidebar-icon" />
          <span className="sidebar-label">User Management</span>
        </div>
      </nav>
      
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <FaUserCircle className="user-icon" />
          <span className="user-label">SUPER ADMIN</span>
        </div>
      </div>
    </aside>
  );
};

export default SuperAdminSidebar;
