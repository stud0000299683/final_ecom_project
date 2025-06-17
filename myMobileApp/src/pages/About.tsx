import { IonContent, IonHeader, IonMenuButton, IonButtons,IonPage, IonTitle, IonToolbar } from '@ionic/react';

const About: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton /> {/* Кнопка меню */}
          </IonButtons>
          <IonTitle>О нас</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen style={{ padding: '20px' }}>
        <h2>О проекте</h2>
        <p>Это страница с информацией о нашем приложении.</p>
      </IonContent>
    </IonPage>
  );
};

export default About;