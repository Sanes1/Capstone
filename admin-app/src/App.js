import React, { useState } from 'react';
import Login from './components/Login';
import AdminSidebar from './components/AdminSidebar';
import AdminDashboard from './components/AdminDashboard';
import MyTickets from './components/MyTickets';
import TicketDetails from './components/TicketDetails';
import Analytics from './components/Analytics';
import BulletinBoard from './components/BulletinBoard';
import Feedback from './components/Feedback';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('adminLoggedIn') === 'true';
  });
  const [selectedDepartment, setSelectedDepartment] = useState(() => {
    return localStorage.getItem('adminDepartment') || '';
  });
  const [activePage, setActivePage] = useState('dashboard');

  const handleLogin = (department) => {
    setSelectedDepartment(department);
    setIsLoggedIn(true);
    localStorage.setItem('adminLoggedIn', 'true');
    localStorage.setItem('adminDepartment', department);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setSelectedDepartment('');
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('adminDepartment');
  };

  const handleNavigate = (page) => {
    setActivePage(page);
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <AdminSidebar 
        activePage={activePage} 
        onNavigate={handleNavigate}
        department={selectedDepartment.toUpperCase()}
      />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {activePage === 'dashboard' && <AdminDashboard department={selectedDepartment} />}
        {activePage === 'my-tickets' && <MyTickets department={selectedDepartment} onNavigate={handleNavigate} />}
        {activePage === 'ticket-details' && <TicketDetails department={selectedDepartment} onNavigate={handleNavigate} />}
        {activePage === 'analytics' && <Analytics department={selectedDepartment} />}
        {activePage === 'bulletin' && <BulletinBoard department={selectedDepartment} />}
        {activePage === 'feedback' && <Feedback department={selectedDepartment} />}
      </div>
    </div>
  );
}

export default App;
