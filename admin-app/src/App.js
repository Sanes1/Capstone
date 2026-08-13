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
    const stored = localStorage.getItem('adminActivePage');
    // Ticket Details needs the ticket object, which isn't persisted — restoring
    // it after a refresh would trap the app on the loading screen.
    return stored && stored !== 'ticket-details' ? stored : 'dashboard';
  });
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showProfileSettings, setShowProfileSettings] = useState(false);

  const handleLogin = (department) => {
    setSelectedDepartment(department);
    setIsLoggedIn(true);
    setActivePage('dashboard'); // Always go to dashboard on login
    localStorage.setItem('adminActivePage', 'dashboard'); // Reset to dashboard
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

  // Open a ticket straight from a notification click — same path as
  // "View Ticket" buttons (sets the ticket + navigates to its details).
  const handleViewTicket = (ticket) => {
    handleNavigate('ticket-details', ticket);
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
        {activePage === 'dashboard' && <AdminDashboard department={selectedDepartment} onNavigate={handleNavigate} onViewRequest={handleViewTicket} />}
        {activePage === 'my-tickets' && <MyTickets department={selectedDepartment} onNavigate={handleNavigate} onViewRequest={handleViewTicket} />}
        {activePage === 'ticket-details' && selectedTicket && <TicketDetails ticketData={selectedTicket} department={selectedDepartment} onNavigate={handleNavigate} onViewRequest={handleViewTicket} />}
        {activePage === 'analytics' && <Analytics department={selectedDepartment} onViewRequest={handleViewTicket} />}
        {activePage === 'bulletin' && <BulletinBoard department={selectedDepartment} onViewRequest={handleViewTicket} />}
        {activePage === 'feedback' && <Feedback department={selectedDepartment} onViewRequest={handleViewTicket} />}
      </div>
      
      {showProfileSettings && (
        <ProfileSettings onClose={() => setShowProfileSettings(false)} />
      )}
    </div>
  );
}

export default App;
