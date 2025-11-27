import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaPlane, FaUser, FaCrown, FaBlog, FaNewspaper } from 'react-icons/fa';
import './Navbar.css';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <img src="/withpass-logo.png" alt="WithPass" className="navbar-logo-img" />
        </Link>

        <ul className="navbar-menu">
          {isAuthenticated ? (
            <>
              <li>
                <Link to="/search" className="navbar-link">
                  Search Flights
                </Link>
              </li>
              <li>
                <Link to="/news" className="navbar-link">
                  <FaNewspaper /> News
                </Link>
              </li>
              <li>
                <Link to="/blog" className="navbar-link">
                  <FaBlog /> Blog
                </Link>
              </li>
              <li>
                <Link to="/profile" className="navbar-link">
                  <FaUser /> Profile
                </Link>
              </li>
              {!user?.isPremium && (
                <li>
                  <Link to="/premium" className="navbar-link premium-link">
                    <FaCrown /> Go Premium
                  </Link>
                </li>
              )}
              {user?.isPremium && (
                <li>
                  <span className="premium-badge">
                    <FaCrown /> Premium
                  </span>
                </li>
              )}
              <li>
                <button onClick={logout} className="navbar-btn">
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/news" className="navbar-link">
                  <FaNewspaper /> News
                </Link>
              </li>
              <li>
                <Link to="/blog" className="navbar-link">
                  <FaBlog /> Blog
                </Link>
              </li>
              <li>
                <Link to="/login" className="navbar-link">
                  Login
                </Link>
              </li>
              <li>
                <Link to="/register" className="navbar-btn-link">
                  Register
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
