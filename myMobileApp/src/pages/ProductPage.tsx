import { IonContent, IonImg, IonHeader, IonPage, IonTitle, IonToolbar, IonList, IonItem, IonLabel, IonLoading, IonMenuButton } from '@ionic/react';
import { useState, useEffect } from 'react';
import { IonBackButton, IonButtons } from '@ionic/react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import './Home.css';

interface Product {
  id: number;
  name: string;
  price: number;
  description?: string;
  main_image?: string;
  category_id: number;
}

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const searchParams = new URLSearchParams(location.search);
        const categoryId = searchParams.get('category_id');
        
        let url = 'http://127.0.0.1:8000/api/v1/products/';
        if (categoryId) {
          url += `?category_id=${categoryId}`;
        }

        const response = await axios.get(url);
        setProducts(response.data);
      } catch (err) {
        setError('Ошибка при загрузке товаров');
        console.error('Ошибка:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [location.search]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton /> {/* Кнопка меню */}
          </IonButtons>
          <IonTitle>Товары</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonLoading isOpen={loading} message="Загрузка товаров..." />
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <IonList>
          {products.map((product) => (
            <IonItem key={product.id} routerLink={`/product/${product.id}`}>
              {product.main_image && (
                <IonImg 
                  slot="start" 
                  src={`http://127.0.0.1:8000${product.main_image}`} 
                  style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                />
              )}
              <IonLabel>
                <h2>{product.name}</h2>
                <p>{product.price} ₽</p>
                {product.description && <p className="product-description">{product.description}</p>}
              </IonLabel>
            </IonItem>
          ))}
        </IonList>

        {!loading && !error && products.length === 0 && (
          <div className="empty-message">
            Товары не найдены
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default ProductsPage;