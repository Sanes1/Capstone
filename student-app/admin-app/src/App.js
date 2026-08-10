import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import AdminSidebar from './components/AdminSidebar';
import AdminDashboard from './components/AdminDashboard';
import MyTickets from './components/MyTickets';
import TicketDetails from './components/TicketDetails';
import Analytics from './components/Analytics';
import BulletinBoard from './components/BulletinBoard';
import Feedback from './components/Feedback';
import ProfileSettings from './components/ProfileSettings';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    // Check if staffData exists (from Firebase authentication)
    const staffData = localStorage.getItem('staffData');
    return staffData !== null;
  });
  const [selectedDepartment, setSelectedDepartment] = useState(() => {
    const staffData = localStorage.getItem('staffData');
    if (staffData) {
      try {
        const parsed = JSON.parse(staffData);
        return parsed.office || '';
      } catch (e) {
        return '';
      }
    }
    return '';
  });
  const [activePage, setActivePage] = useState(() => {
    return localStorage.getItem('adminActivePage') || 'dashboard';
  });
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showProfileSettings, setShowProfileSettings] = useState(false);

  const handleLogin = (department) => {
    setSelectedDepartment(department);
    setIsLoggedIn(true);
    // Don't set these anymore - staffData is set by Login component
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setSelectedDepartment('');
    localStorage.removeItem('staffData');
  };

  const handleNavigate = (page, ticket = null) => {
    setActivePage(page);
    if (ticket) {
      setSelectedTicket(ticket);
    }
  };

  // Save active page to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('adminActivePage', activePage);
  }, [activePage]);

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <AdminSidebar 
        activePage={activePage} 
        onNavigate={handleNavigate}
        department={selectedDepartment.toUpperCase()}
        onOpenProfile={() => setShowProfileSettings(true)}
      />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {activePage === 'dashboard' && <AdminDashboard department={selectedDepartment} />}
        {activePage === 'my-tickets' && <MyTickets department={selectedDepartment} onNavigate={handleNavigate} />}
        {activePage === 'ticket-details' && <TicketDetails ticketData={selectedTicket} department={selectedDepartment} onNavigate={handleNavigate} />}
        {activePage === 'analytics' && <Analytics department={selectedDepartment} />}
        {activePage === 'bulletin' && <BulletinBoard department={selectedDepartment} />}
        {activePage === 'feedback' && <Feedback department={selectedDepartment} />}
      </div>
      
      {showProfileSettings && (
        <ProfileSettings onClose={() => setShowProfileSettings(false)} />
      )}
    </div>
  );
}

export default App;
