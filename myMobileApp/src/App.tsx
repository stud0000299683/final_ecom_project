import { Redirect, Route } from 'react-router-dom';
import { 
  IonApp, 
  IonRouterOutlet, 
  IonSplitPane,
  IonMenu,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  setupIonicReact
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { home, list, informationCircle } from 'ionicons/icons';
import Home from './pages/Home';
import ProductsPage from './pages/ProductPage';
import About from './pages/About';
import ProductDetail from './pages/ProductDetail';

/* Core CSS imports остаются теми же */
import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';
import '@ionic/react/css/palettes/dark.system.css';
import './theme/variables.css';

setupIonicReact();

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <IonSplitPane contentId="main">
        {/* Боковое меню */}
        <IonMenu contentId="main">
          <IonHeader>
            <IonToolbar>
              <IonTitle>Меню</IonTitle>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <IonList>
              <IonItem routerLink="/home" routerDirection="root">
                <IonIcon slot="start" icon={home} />
                <IonLabel>Главная</IonLabel>
              </IonItem>
              <IonItem routerLink="/products" routerDirection="root">
                <IonIcon slot="start" icon={list} />
                <IonLabel>Товары</IonLabel>
              </IonItem>
              <IonItem routerLink="/about" routerDirection="root">
                <IonIcon slot="start" icon={informationCircle} />
                <IonLabel>О нас</IonLabel>
              </IonItem>
            </IonList>
          </IonContent>
        </IonMenu>

        {/* Основное содержимое */}
        <IonRouterOutlet id="main">
          <Route exact path="/home" component={Home} />
          <Route exact path="/products" component={ProductsPage} />
          <Route exact path="/product/:id" component={ProductDetail} />
          <Route exact path="/about" component={About} />
          <Route exact path="/" render={() => <Redirect to="/home" />} />
        </IonRouterOutlet>
      </IonSplitPane>
    </IonReactRouter>
  </IonApp>
);

export default App;
