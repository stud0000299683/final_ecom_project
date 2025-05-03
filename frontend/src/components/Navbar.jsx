import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { FavouritesContext } from '../context/FavouritesContext';

const Navbar = ({ isAuthenticated, onLogout }) => {
  const { favourites } = useContext(FavouritesContext);

  return (
    <nav style={{ padding: '10px', background: '#f0f0f0', display: 'flex', alignItems: 'center' }}>
      <Link to="/" style={{ marginRight: '15px', textDecoration: 'none' }}>Главная</Link>
      {isAuthenticated ? (
        <>
          <Link to="/profile" style={{ marginRight: '15px', textDecoration: 'none' }}>Профиль</Link>
          <Link
            to="/favourites"
            style={{
              marginRight: '15px',
              textDecoration: 'none',
              position: 'relative'
            }}
          >
            Избранное
            {favourites.length > 0 && (
              <span style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                background: '#ff4444',
                color: 'white',
                borderRadius: '50%',
                width: '20px',
                height: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px'
              }}>
                {favourites.length}
              </span>
            )}
          </Link>
          <button
            onClick={onLogout}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#333'
            }}
          >
            Выйти
          </button>
        </>
      ) : (
        <Link to="/login" style={{ textDecoration: 'none' }}>Войти</Link>
      )}
    </nav>
  );
};

export default Navbar;