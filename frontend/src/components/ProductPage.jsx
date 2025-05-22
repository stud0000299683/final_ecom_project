import React, { useState, useEffect, useContext } from 'react';
import { FavouritesContext } from '../context/FavouritesContext';

const ProductPage = () => {
  const { addToFavourites, removeFromFavourites, isFavourite } = useContext(FavouritesContext);
  const [isFav, setIsFav] = useState(false);

  useEffect(() => {
    setIsFav(isFavourite(product.id));
  }, [product.id, isFavourite]);

  const toggleFavourite = () => {
    if (isFav) {
      removeFromFavourites(product.id);
    } else {
      addToFavourites({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.main_image,
        category_id: product.category_id
      });
    }
    setIsFav(!isFav);
  };

  return (
    <Button
      variant={isFav ? "danger" : "outline-secondary"}
      onClick={toggleFavourite}
    >
      {isFav ? 'В избранном' : 'В избранное'}
    </Button>
  );
};