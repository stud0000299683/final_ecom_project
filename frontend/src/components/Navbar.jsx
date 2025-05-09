import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFavourites } from '../context/FavouritesContext';
import { useCart } from '../context/CartContext';
import { Button } from 'react-bootstrap';

const Navbar = ({ isAuthenticated, onLogout }) => {
  const { favourites } = useFavourites();
  const { cart } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/'); // Перенаправляем на главную после выхода
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container">
        <Link className="navbar-brand" to="/">Магазин</Link>
        <div className="d-flex">
          {isAuthenticated ? (
            <>
              <Link className="nav-link mx-2" to="/profile">Профиль</Link>
              <Link className="nav-link mx-2" to="/favourites">
                Избранное {favourites.length > 0 && `(${favourites.length})`}
              </Link>
              <Link className="nav-link mx-2" to="/cart">
                Корзина {cart?.items?.length > 0 && <span className="badge bg-primary">{cart.items.length}</span>}
              </Link>
              <Button variant="outline-danger" className="ms-2" onClick={handleLogout}>Выйти</Button>
            </>
          ) : (
            <>
              <Link className="nav-link" to="/login">Войти</Link>
              <Link className="nav-link" to="/cart">Корзина</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;