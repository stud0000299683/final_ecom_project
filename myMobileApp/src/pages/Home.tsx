import { IonContent, IonHeader, IonButtons, IonMenuButton, IonPage, IonTitle, IonToolbar, IonList, IonItem, IonLabel, IonLoading, IonImg, 
  IonCard, IonCardContent, IonCardHeader, IonCardTitle } from '@ionic/react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import './Home.css';

// Типы данных для API
interface Product {
  id: number;
  name: string;
  price: number;
  description?: string;
  main_image?: string;
  additional_images_urls?: string[];
  category_id: number;
}

interface Category {
  id: number;
  name: string;
  image_url?: string;
}

const Home: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Получаем категории
        const categoriesResponse = await axios.get('http://127.0.0.1:8000/api/v1/categories/');
        setCategories(categoriesResponse.data);

        // Получаем товары
        const productsResponse = await axios.get('http://127.0.0.1:8000/api/v1/products/');
        setProducts(productsResponse.data);

      } catch (err) {
        setError('Ошибка при загрузке данных');
        console.error('Ошибка:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton /> {/* Кнопка меню */}
          </IonButtons>
          <IonTitle>Каталог товаров</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonLoading isOpen={loading} message="Загрузка данных..." />

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* Список категорий */}
        <h2 className="section-title">Категории</h2>
        <div className="categories-container">
          {categories.map((category) => (
            <IonCard key={category.id} routerLink={`/products?category_id=${category.id}`}>
              {category.image_url && (
                <IonImg src={`http://127.0.0.1:8000${category.image_url}`} />
              )}
              <IonCardHeader>
                <IonCardTitle>{category.name}</IonCardTitle>
              </IonCardHeader>
            </IonCard>
          ))}
        </div>

        {/* Список товаров */}
        <h2 className="section-title">Популярные товары</h2>
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

export default Home;