import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaPlane, FaUser, FaCrown, FaBlog, FaChevronDown } from 'react-icons/fa';
import './Navbar.css';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <div className="logo-circle">
            <FaPlane className="logo-icon" />
          </div>
          <div className="logo-text">
            <div className="logo-title">WITHPASS</div>
            <div className="logo-subtitle">VISA FREE TRAVEL</div>
          </div>
        </Link>

        <ul className="navbar-menu">
          {isAuthenticated ? (
            <>
              <li>
                <Link to="/search" className="navbar-link">
                  <FaPlane /> Flight Search
                </Link>
              </li>
              <li>
                <Link to="/blog" className="navbar-link">
                  <FaBlog /> Blog
                </Link>
              </li>
              <li className="navbar-dropdown" ref={dropdownRef}>
                <button 
                  type="button"
                  className="navbar-user-btn" 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <FaUser /> {user?.name || 'User'} <FaChevronDown />
                </button>
                {dropdownOpen && (
                  <div className="navbar-dropdown-menu">
                    <Link to="/profile" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                      <FaUser /> Profile
                    </Link>
                    {!user?.isPremium && (
                      <Link to="/premium" className="dropdown-item premium-item" onClick={() => setDropdownOpen(false)}>
                        <FaCrown /> Go Premium
                      </Link>
                    )}
                    {user?.isPremium && (
                      <Link to="/premium" className="dropdown-item premium-badge-item" onClick={() => setDropdownOpen(false)}>
                        <FaCrown /> Premium Member
                      </Link>
                    )}
                    <button type="button" onClick={() => { logout(); setDropdownOpen(false); }} className="dropdown-item logout-item">
                      Logout
                    </button>
                  </div>
                )}
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/search" className="navbar-link">
                  <FaPlane /> Flight Search
                </Link>
              </li>
              <li>
                <Link to="/blog" className="navbar-link">
                  <FaBlog /> Blog
                </Link>
              </li>
              <li>
                <Link to="/login" className="navbar-btn-link">
                  Login
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
