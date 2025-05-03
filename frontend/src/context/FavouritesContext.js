import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
// Добавлен импорт useMemo ↑

export const FavouritesContext = createContext();

export const FavouritesProvider = ({ children }) => {
  const [favourites, setFavourites] = useState([]);

  // Загрузка избранного при инициализации
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('favourites')) || [];
    setFavourites(saved);
  }, []);

  // Обновление localStorage при изменении избранного
  useEffect(() => {
    localStorage.setItem('favourites', JSON.stringify(favourites));
  }, [favourites]);

  // Мемоизированные функции
  const addToFavourites = useCallback((product) => {
    setFavourites(prev => {
      if (!prev.some(item => item.id === product.id)) {
        return [...prev, product];
      }
      return prev;
    });
  }, []);

  const removeFromFavourites = useCallback((productId) => {
    setFavourites(prev => prev.filter(item => item.id !== productId));
  }, []);

  const isFavourite = useCallback((productId) => {
    return favourites.some(item => item.id === productId);
  }, [favourites]);

  // Мемоизированное значение контекста
  const contextValue = useMemo(() => ({
    favourites,
    addToFavourites,
    removeFromFavourites,
    isFavourite
  }), [favourites, addToFavourites, removeFromFavourites, isFavourite]);

  return (
    <FavouritesContext.Provider value={contextValue}>
      {children}
    </FavouritesContext.Provider>
  );
};