import { 
  IonContent, 
  IonHeader, 
  IonPage, 
  IonTitle, 
  IonToolbar, 
  IonImg, 
  IonCard, 
  IonCardHeader, 
  IonCardTitle, 
  IonCardContent, 
  IonButtons, 
  IonBackButton,
  IonLoading,
  IonMenuButton
} from '@ionic/react';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useParams, useHistory } from 'react-router-dom';
import './Home.css';

interface Product {
  id: number;
  name: string;
  price: number;
  description?: string;
  main_image?: string;
  additional_images?: string[];
  category_id: number;
}

const ProductDetail: React.FC = () => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const contentRef = useRef<HTMLIonContentElement>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/v1/products/${id}/`);
        setProduct(response.data);
      } catch (err) {
        console.error('Ошибка:', err);
        history.replace('/products');
      } finally {
        setLoading(false);
        // После загрузки сбрасываем фокус
        setTimeout(() => {
          if (contentRef.current) {
            contentRef.current.setFocus();
          }
        }, 100);
      }
    };

    fetchProduct();
  }, [id, history]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
            <IonButtons slot="start">
              <IonMenuButton /> {/* Кнопка меню */}
            <IonBackButton defaultHref="/products" />
          </IonButtons>
          <IonTitle>Детали товара</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent ref={contentRef} className="ion-padding">
        <IonLoading isOpen={loading} message="Загрузка..." />
        
        {product && (
          <IonCard>
            {product.main_image && (
              <IonImg 
                src={`http://127.0.0.1:8000${product.main_image}`} 
                alt={product.name}
              />
            )}
            <IonCardHeader>
              <IonCardTitle>{product.name}</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <h2>{product.price} ₽</h2>
              <p>{product.description}</p>
              
              {product.additional_images && product.additional_images.length > 0 && (
                <div className="additional-images">
                  <h3>Дополнительные фото:</h3>
                  {product.additional_images.map((img, index) => (
                    <IonImg 
                      key={index} 
                      src={`http://127.0.0.1:8000${img}`} 
                      alt={`Дополнительное фото ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </IonCardContent>
          </IonCard>
        )}
      </IonContent>
    </IonPage>
  );
};

export default ProductDetail;