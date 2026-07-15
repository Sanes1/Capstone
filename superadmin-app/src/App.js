import React, { useState } from 'react';
import Login from './components/Login';
import SuperAdminSidebar from './components/SuperAdminSidebar';
import SuperAdminDashboard from './components/SuperAdminDashboard';
import EditRequestForm from './components/EditRequestForm';
import Analytics from './components/Analytics';
import UserManagement from './components/UserManagement';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activePage, setActivePage] = useState('dashboard');

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleNavigate = (page) => {
    setActivePage(page);
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="superadmin-app">
      <SuperAdminSidebar activePage={activePage} onNavigate={handleNavigate} />
      <div className="superadmin-main">
        {activePage === 'dashboard' && <SuperAdminDashboard />}
        {activePage === 'edit-request' && <EditRequestForm />}
        {activePage === 'analytics' && <Analytics />}
        {activePage === 'user-management' && <UserManagement />}
      </div>
    </div>
  );
}

export default App;
