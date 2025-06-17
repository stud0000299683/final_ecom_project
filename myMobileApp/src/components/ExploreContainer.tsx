// import './ExploreContainer.css';

// interface ContainerProps { }

// const ExploreContainer: React.FC<ContainerProps> = () => {
//   return (
//     <div id="container">
//       <strong>Ready to create an app?</strong>
//       <p>Start with Ionic <a target="_blank" rel="noopener noreferrer" href="https://ionicframework.com/docs/components">UI Components</a></p>
//     </div>
//   );
// };

// export default ExploreContainer;

import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonImg, IonGrid, IonRow, IonCol } from '@ionic/react';
import { useEffect, useState } from 'react';
import { getCategories, Category } from '../services/category.service';
import './Home.css';

const Home: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const loadCategories = async () => {
      const data = await getCategories();
      setCategories(data);
    };
    loadCategories();
  }, []);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Категории</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonGrid>
          <IonRow>
            {categories.map((category) => (
              <IonCol size="6" key={category.id}>
                <IonCard>
                  {category.image_url && (
                    <IonImg 
                      src={category.image_url} 
                      alt={category.name}
                      style={{ height: '150px', objectFit: 'cover' }}
                    />
                  )}
                  <IonCardHeader>
                    <IonCardTitle>{category.name}</IonCardTitle>
                  </IonCardHeader>
                </IonCard>
              </IonCol>
            ))}
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default Home;