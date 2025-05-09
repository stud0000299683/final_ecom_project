import React, { useState, Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import { FavouritesProvider } from './context/FavouritesContext';
import { CartProvider } from './context/CartContext';
import { getCurrentUser } from './services/auth';
import './styles.css';


// Ленивая загрузка только существующих компонентов
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Profile = lazy(() => import('./pages/Profile'));
const CategoryPage = lazy(() => import('./pages/Category'));
const ProductPage = lazy(() => import('./pages/Product'));
const Favourites = lazy(() => import('./pages/Favourites'));
const Cart = lazy(() => import('./components/Cart'));

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!getCurrentUser());

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
  };


  return (
    <div className="App">
      <FavouritesProvider>
        <CartProvider>
          <Navbar
            isAuthenticated={isAuthenticated}
            onLogout={handleLogout}
          />

          <Suspense fallback={<div className="text-center my-5">Загрузка...</div>}>
            <Routes>
              {/* Публичные маршруты */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login onLogin={handleLogin} />} />
              <Route path="/category/:id" element={<CategoryPage />} />
              <Route path="/product/:id" element={<ProductPage />} />

              {/* Защищенные маршруты */}
              <Route path="/profile" element={
                isAuthenticated ? <Profile /> : <Navigate to="/login" state={{ from: '/profile' }} replace />
              } />

              <Route path="/favourites" element={
                isAuthenticated ? <Favourites /> : <Navigate to="/login" state={{ from: '/favourites' }} replace />
              } />

              <Route path="/cart" element={
                isAuthenticated ? <Cart /> : <Navigate to="/login" state={{ from: '/cart' }} replace />
              } />

              {/* Фолбэк для несуществующих маршрутов */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </CartProvider>
      </FavouritesProvider>
    </div>
  );
};

export default App;