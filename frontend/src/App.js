import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import { FavouritesProvider } from './context/FavouritesContext';
import { getCurrentUser } from './services/auth';
import './styles.css';

// Ленивая загрузка страниц
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Profile = lazy(() => import('./pages/Profile'));
const CategoryPage = lazy(() => import('./pages/Category'));
const ProductPage = lazy(() => import('./pages/Product'));
const Favourites = lazy(() => import('./pages/Favourites'));

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
      <FavouritesProvider>
        <Navbar
          isAuthenticated={isAuthenticated}
          onLogout={() => {
            localStorage.removeItem('user');
            setIsAuthenticated(false);
          }}
        />
        <Suspense fallback={<div className="text-center my-5">Загрузка...</div>}>
          <Routes>
            <Route path="/" element={<Home isAuthenticated={isAuthenticated} />} />
            <Route path="/login" element={<Login onLogin={() => setIsAuthenticated(true)} />} />
            <Route path="/profile" element={isAuthenticated ? (<Profile />) : (<Navigate to="/login" replace />)} />
            <Route path="/category/:id" element={isAuthenticated ? (<CategoryPage />) : (<Navigate to="/login" replace />)} />
            <Route path="/product/:id" element={<ProductPage />} />
            <Route path="/favourites" element={<Favourites />} />
          </Routes>
        </Suspense>
      </FavouritesProvider>
    </div>
  );
};

export default App;