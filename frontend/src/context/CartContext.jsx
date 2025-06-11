import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const navigate = useNavigate();
  const [cart, setCart] = useState({ items: [] });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const getAuthToken = useCallback(() => {
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      return userData?.access_token;
    } catch (e) {
      console.error('Token parsing error:', e);
      return null;
    }
  }, []);

  const createApiInstance = useCallback(() => {
    const token = getAuthToken();
    return axios.create({
      baseURL: 'http://localhost:8000/api/v1',
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
  }, [getAuthToken]);

  const fetchUserCart = useCallback(async (userId) => {
    try {
      const api = createApiInstance();
      const { data } = await api.get(`/carts/user/${userId}`);
      return data;
    } catch (error) {
      console.error('Failed to fetch cart:', error);
      throw error;
    }
  }, [createApiInstance]);

  const addToCart = useCallback(async (productId) => {
    setIsLoading(true);
    try {
      const api = createApiInstance();
      const token = getAuthToken();
      if (!token) throw new Error('Token not found');

      const { data: user } = await api.get('/users/me');
      if (!user?.id) throw new Error('User not authenticated');

      let userCart;
      try {
        userCart = await fetchUserCart(user.id);
      } catch (error) {
        if (error.response?.status === 404) {
          const { data: newCart } = await api.post('/carts/', { user_id: user.id });
          //userCart = newCart;
        } else {
          throw error;
        }
      }

      await api.post(`/carts/user/${user.id}/items/${productId}`);
      const updatedCart = await fetchUserCart(user.id);
      setCart(updatedCart);
      return true;
    } catch (error) {
      console.error('Error:', error);
      setError(error.response?.data?.detail || error.message);

      if (error.response?.status === 401) {
        localStorage.removeItem('user');
        navigate('/login');
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [createApiInstance, fetchUserCart, getAuthToken, navigate]);

  const removeFromCart = useCallback(async (productId) => {
    setIsLoading(true);
    try {
      const api = createApiInstance();
      const { data: user } = await api.get('/users/me');

      const { data: cartData } = await api.get(`/carts/user/${user.id}`);
      await api.delete(`/carts/user/${user.id}/items/${productId}`);

      const updatedCart = await fetchUserCart(user.id);
      setCart(updatedCart);
      return true;
    } catch (error) {
      console.error('Error removing item:', error);
      setError(error.response?.data?.detail || error.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [createApiInstance, fetchUserCart]);

  const isInCart = useCallback(
    (productId) => cart.items?.some(item => item.id === productId) || false,
    [cart.items]
  );

  useEffect(() => {
    const loadCart = async () => {
      const token = getAuthToken();
      if (!token) return;

      try {
        const api = createApiInstance();
        const { data: user } = await api.get('/users/me');
        if (user?.id) {
          const cartData = await fetchUserCart(user.id);
          setCart(cartData);
        }
      } catch (error) {
        console.error('Cart loading error:', error);
      }
    };

    loadCart();
  }, [createApiInstance, fetchUserCart, getAuthToken]);

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      isInCart,
      error,
      isLoading
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};