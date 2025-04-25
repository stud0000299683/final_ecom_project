import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = ({ isAuthenticated, onLogout }) => {
  return (
    <nav style={{ padding: '10px', background: '#f0f0f0' }}>
      <Link to="/" style={{ marginRight: '10px' }}>Home</Link>
      {isAuthenticated ? (
        <>
          <Link to="/profile" style={{ marginRight: '10px' }}>Profile</Link>
          <button onClick={onLogout}>Logout</button>
        </>
      ) : (
        <Link to="/login">Login</Link>
      )}
    </nav>
  );
};

export default Navbar;