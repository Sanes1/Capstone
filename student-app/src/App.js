import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import GuestLogin from './components/GuestLogin';
import ChangePasswordModal from './components/ChangePasswordModal';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import MyRequest from './components/MyRequest';
import RequestDetails from './components/RequestDetails';
import NewRequest from './components/NewRequest';
import Feedback from './components/Feedback';
import BulletinBoard from './components/BulletinBoard';
import FAQs from './components/FAQs';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('studentLoggedIn') === 'true';
  });
  const [isGuest, setIsGuest] = useState(() => {
    return localStorage.getItem('studentIsGuest') === 'true';
  });
  const [activePage, setActivePage] = useState('dashboard');
  const [selectedRequest, setSelectedRequest] = useState(null); // Store selected request
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [studentData, setStudentData] = useState(null);

  // Check if user must change password on login
  useEffect(() => {
    if (isLoggedIn && !isGuest) {
      const storedData = localStorage.getItem('studentData');
      if (storedData) {
        const data = JSON.parse(storedData);
        setStudentData(data);
        setMustChangePassword(data.mustChangePassword === true);
      }
    }
  }, [isLoggedIn, isGuest]);

  const handleLogin = () => {
    setIsLoggedIn(true);
    setIsGuest(false);
    localStorage.setItem('studentLoggedIn', 'true');
    localStorage.setItem('studentIsGuest', 'false');
  };

  const handleGuestLogin = () => {
    setIsGuest(true);
    setIsLoggedIn(false);
    localStorage.setItem('studentIsGuest', 'true');
    localStorage.setItem('studentLoggedIn', 'false');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsGuest(false);
    localStorage.removeItem('studentLoggedIn');
    localStorage.removeItem('studentIsGuest');
  };

  const handlePasswordChanged = () => {
    setMustChangePassword(false);
    // Reload student data
    const storedData = localStorage.getItem('studentData');
    if (storedData) {
      setStudentData(JSON.parse(storedData));
    }
  };
  
  const handleViewRequestDetails = (request) => {
    setSelectedRequest(request);
    setActivePage('request-details');
  };

  const renderPage = () => {
    switch(activePage) {
      case 'dashboard':
        return <Dashboard onNavigate={setActivePage} />;
      case 'request':
        return <MyRequest onViewDetails={handleViewRequestDetails} onNavigate={setActivePage} />;
      case 'request-details':
        return <RequestDetails requestData={selectedRequest} onNavigate={setActivePage} />;
      case 'new-request':
        return <NewRequest onNavigate={setActivePage} />;
      case 'bulletin':
        return <BulletinBoard />;
      case 'feedback':
        return <Feedback />;
      case 'feedback-discipline':
        return <Feedback selectedOffice="discipline" />;
      case 'feedback-library':
        return <Feedback selectedOffice="library" />;
      case 'feedback-registrar':
        return <Feedback selectedOffice="registrar" />;
      case 'feedback-finance':
        return <Feedback selectedOffice="finance" />;
      case 'faq':
        return <FAQs />;
      default:
        return <Dashboard onNavigate={setActivePage} />;
    }
  };

  if (!isLoggedIn && !isGuest) {
    return <Login onLogin={handleLogin} onGuestLogin={handleGuestLogin} />;
  }

  if (isGuest) {
    return <GuestLogin />;
  }

  // Show password change modal if required
  if (mustChangePassword && studentData) {
    return <ChangePasswordModal studentData={studentData} onPasswordChanged={handlePasswordChanged} />;
  }

  return (
    <div className="app">
      <Header />
      <div className="app-body">
        <Sidebar activePage={activePage} onNavigate={setActivePage} />
        <main className="main-content">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

export default App;
