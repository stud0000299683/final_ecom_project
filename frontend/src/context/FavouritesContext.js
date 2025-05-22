import React, { createContext, useState, useEffect, useCallback, useMemo, useContext } from 'react';

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

    const value = useMemo(() => ({
    favourites,
    addToFavourites,
    removeFromFavourites,
    isFavourite
  }), [favourites, addToFavourites, removeFromFavourites, isFavourite]);

  return (
    <FavouritesContext.Provider value={value}>
      {children}
    </FavouritesContext.Provider>
  );
};

// Создаем хук
export const useFavourites = () => {
  const context = useContext(FavouritesContext);
  if (context === undefined) {
    throw new Error('useFavourites must be used within a FavouritesProvider');
  }
  return context;
};
