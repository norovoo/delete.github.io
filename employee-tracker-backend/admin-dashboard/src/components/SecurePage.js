import React from 'react';
import InactivityTimeout from './Inactivity';

const SecurePage = ({ onLogout }) => {
  const handleLogout = () => {
    // Clear authentication data
    localStorage.removeItem('authToken'); // Remove token
    sessionStorage.clear(); // Clear session storage
    alert('You have been logged out due to inactivity.');
  };

  return (
    <div>
      <InactivityTimeout onLogout={handleLogout} />
      <h1>Secure Page</h1>
      <p>You will be logged out after 20 minutes of inactivity.</p>
    </div>
  );
};

export default SecurePage;