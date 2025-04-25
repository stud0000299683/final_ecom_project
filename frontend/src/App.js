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

  useEffect(() => {
    const user = getCurrentUser();
    setIsAuthenticated(!!user);
  }, []);

  return (
    <div className="App">
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