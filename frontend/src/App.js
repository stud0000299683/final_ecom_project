import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Profile from './pages/Profile';
import { getCurrentUser } from './services/auth';
import './styles.css';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const user = getCurrentUser();
    setIsAuthenticated(!!user);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="App">
      {!isOnline && (
        <div style={{
          background: '#ff9800',
          color: 'white',
          padding: '10px',
          textAlign: 'center'
        }}>
          Вы находитесь в офлайн-режиме. Некоторые данные могут быть устаревшими.
        </div>
      )}
      <Navbar 
        isAuthenticated={isAuthenticated} 
        onLogout={() => {
          localStorage.removeItem('user');
          setIsAuthenticated(false);
        }} 
      />
      <Routes>
        <Route path="/" element={<Home isAuthenticated={isAuthenticated} />} />
        <Route 
          path="/login" 
          element={<Login onLogin={() => setIsAuthenticated(true)} />} 
        />
        <Route 
          path="/profile" 
          element={
            isAuthenticated ? (
              <Profile />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
      </Routes>
    </div>
  );
};

export default App;