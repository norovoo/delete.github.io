import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './TopBanner.css';

const TopBanner = ({ username }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleProfileClick = () => {
    navigate('/dashboard/profile');
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <header className="top-banner">
      <div className="profile-section">
        <img
          src={localStorage.getItem('profilePic') || 'https://via.placeholder.com/32'}
          alt="Profile"
          className="profile-picture"
        />
        <span className="username">{username}</span>
        <button
          className="dropdown-toggle"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          ▼
        </button>
        {isDropdownOpen && (
          <div className="dropdown-menu">
            <ul>
              <li onClick={handleProfileClick}>Profile</li>
              <li onClick={handleLogout}>Log Out</li>
            </ul>
          </div>
        )}
      </div>
    </header>
  );
};

export default TopBanner;