import React, { useState } from 'react';
import Login from './components/Login';
import GuestLogin from './components/GuestLogin';
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
  
  const handleViewRequestDetails = (request) => {
    setSelectedRequest(request);
    setActivePage('request-details');
  };

  const renderPage = () => {
    switch(activePage) {
      case 'dashboard':
        return <Dashboard />;
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
        return <Dashboard />;
    }
  };

  if (!isLoggedIn && !isGuest) {
    return <Login onLogin={handleLogin} onGuestLogin={handleGuestLogin} />;
  }

  if (isGuest) {
    return <GuestLogin />;
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
