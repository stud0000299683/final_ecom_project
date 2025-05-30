import React, { useState, useEffect, useContext, useCallback, memo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container, Row, Col, Card, Spinner, Alert, Button,
  Badge, ListGroup, Toast
} from 'react-bootstrap';
import { Carousel } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FavouritesContext } from '../context/FavouritesContext';
import { useCart } from '../context/CartContext';
import { getCurrentUser } from '../services/auth';

// Функция для получения URL изображения
const getImageUrl = (path) => {
  if (!path) return '/placeholder-image.jpg'; // Заглушка если нет изображения
  if (path.startsWith('http')) return path; // Если URL абсолютный
  return `http://localhost:8000${path}`; // Локальный путь
};

// Компонент изображений товара (оптимизирован с memo)
const ProductImages = memo(({ mainImage, additionalImages, onImageClick }) => {
  return (
    <Card className="mb-4">
      {mainImage && (
        <Card.Img
          variant="top"
          src={getImageUrl(mainImage)}
          alt="Основное изображение товара"
          style={{
            maxHeight: '500px',
            width: '100%',
            objectFit: 'contain',
            backgroundColor: '#f8f9fa'
          }}
          className="p-3"
          onError={(e) => {
            e.target.src = '/placeholder-image.jpg'; // Замена битого изображения
          }}
        />
      )}
      {additionalImages && additionalImages.length > 0 && (
        <Carousel
          className="mt-3"
          indicators
          // Черные стрелки для карусели
          prevIcon={<span aria-hidden="true" className="carousel-control-prev-icon" style={{ filter: 'brightness(0)' }} />}
          nextIcon={<span aria-hidden="true" className="carousel-control-next-icon" style={{ filter: 'brightness(0)' }} />}
        >
          {additionalImages.map((img, index) => (
            <Carousel.Item key={index}>
              <img
                className="d-block w-100"
                src={getImageUrl(img)}
                alt={`Изображение товара ${index + 1}`}
                style={{
                  height: '300px',
                  objectFit: 'contain',
                  backgroundColor: '#f8f9fa'
                }}
                onClick={() => onImageClick(img)}
                onError={(e) => {
                  e.target.src = '/placeholder-image.jpg';
                }}
              />
            </Carousel.Item>
          ))}
        </Carousel>
      )}
    </Card>
  );
});

/**
 * Компонент страницы товара
 * Отображает полную информацию о товаре:
 * - Изображения с каруселью
 * - Название, цену и описание
 * - Кнопки добавления в корзину и избранное
 * - Характеристики товара
 */
const ProductPage = () => {
  // Получение параметров из URL
  const { id } = useParams();
  const navigate = useNavigate();

  // Состояния для данных товара и UI
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mainImage, setMainImage] = useState('');

  // Состояния для уведомлений
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showAuthAlert, setShowAuthAlert] = useState(false);
  const [cartToast, setCartToast] = useState({
    show: false,
    message: '',
    variant: 'success'
  });
  const [isItemInCart, setIsItemInCart] = useState(false);

  // Контексты для избранного и корзины
  const { addToFavourites, removeFromFavourites, isFavourite } = useContext(FavouritesContext);
  const { addToCart, isInCart } = useCart();

  // Проверка авторизации пользователя
  const isAuthenticated = !!getCurrentUser();
  const [isFav, setIsFav] = useState(false);

  /**
   * Загрузка данных товара с API
   * Нормализует структуру данных для единообразия
   */
  const fetchProduct = useCallback(async () => {
    try {
      const response = await axios.get(`http://localhost:8000/api/v1/products/${id}`);
      const productData = response.data;

      // Нормализация данных товара
      const normalizedProduct = {
        ...productData,
        main_image: productData.main_image || productData.image || '',
        additional_images_urls: productData.additional_images_urls ||
                              productData.additional_images ||
                              []
      };

      setProduct(normalizedProduct);
      setMainImage(normalizedProduct.main_image);
      setIsFav(isFavourite(normalizedProduct.id));
      setIsItemInCart(isInCart(normalizedProduct.id));
    } catch (err) {
      setError(err.response?.data?.detail || 'Не удалось загрузить данные товара');
      console.error('Ошибка загрузки товара:', err);
    } finally {
      setLoading(false);
    }
  }, [id, isFavourite, isInCart]);

  // Загрузка товара при монтировании компонента
  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  /**
   * Обработчик добавления/удаления из избранного
   * Показывает предупреждение если пользователь не авторизован
   */
  const handleFavouriteAction = useCallback(() => {
    if (!isAuthenticated) {
      setShowAuthAlert(true);
      return;
    }

    if (!product) return;

    if (isFavourite(product.id)) {
      removeFromFavourites(product.id);
      setToastMessage('Товар удален из избранного');
    } else {
      addToFavourites({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.main_image,
        category_id: product.category_id
      });
      setToastMessage('Товар добавлен в избранное');
    }
    setIsFav(!isFav);
    setShowToast(true);
  }, [isAuthenticated, product, isFavourite, addToFavourites, removeFromFavourites, isFav]);

  /**
   * Обработчик добавления в корзину
   * Показывает предупреждение если пользователь не авторизован
   * Обновляет состояние корзины и показывает уведомления
   */
  const handleCartAction = useCallback(async () => {
    if (!isAuthenticated) {
      setShowAuthAlert(true);
      return;
    }

    if (!product) return;

    const success = await addToCart(product.id);
    if (success) {
      setIsItemInCart(true);
      setCartToast({
        show: true,
        message: 'Товар добавлен в корзину',
        variant: 'success'
      });
    } else {
      setCartToast({
        show: true,
        message: error || 'Не удалось добавить товар в корзину',
        variant: 'danger'
      });
    }
  }, [isAuthenticated, product, addToCart]);

  // Обновляет основное изображение при клике на миниатюру
  const handleImageClick = useCallback((img) => {
    setMainImage(img);
  }, []);

  // Перенаправление на страницу входа с сохранением URL
  const handleLoginRedirect = () => {
    navigate('/login', { state: { from: `/product/${id}` } });
  };

  // Состояния загрузки и ошибки
  if (loading) return <Spinner animation="border" className="d-block mx-auto my-5" />;
  if (error) return <Alert variant="danger">{error}</Alert>;
  if (!product) return <Alert variant="warning">Товар не найден</Alert>;

  return (
    <Container className="py-4">
      {/* Уведомление об избранном */}
      <Toast show={showToast} onClose={() => setShowToast(false)} delay={3000} autohide>
        <Toast.Header>
          <strong className="me-auto">Избранное</strong>
        </Toast.Header>
        <Toast.Body>{toastMessage}</Toast.Body>
      </Toast>

      {/* Уведомление о корзине */}
      <Toast
        show={cartToast.show}
        onClose={() => setCartToast(prev => ({...prev, show: false}))}
        delay={3000}
        autohide
        bg={cartToast.variant}
      >
        <Toast.Body className="text-white">{cartToast.message}</Toast.Body>
      </Toast>

      {/* Предупреждение о необходимости авторизации */}
      <Toast show={showAuthAlert} onClose={() => setShowAuthAlert(false)} delay={3000} autohide>
        <Toast.Header closeButton={false} className="bg-warning">
          <strong className="me-auto">Требуется авторизация</strong>
        </Toast.Header>
        <Toast.Body>
          <Button variant="warning" size="sm" onClick={handleLoginRedirect}>
            Войти в систему
          </Button>
        </Toast.Body>
      </Toast>

      {/* Основное содержимое страницы */}
      <Row>
        {/* Колонка с изображениями */}
        <Col md={6}>
          <ProductImages
            mainImage={mainImage}
            additionalImages={product.additional_images_urls}
            onImageClick={handleImageClick}
          />
        </Col>

        {/* Колонка с информацией о товаре */}
        <Col md={6}>
          <Card className="mb-4 h-100">
            <Card.Body className="d-flex flex-column">
              <Card.Title as="h2">{product.name}</Card.Title>
              <Link to={`/category/${product.category_id}`} className="text-muted mb-3">
                ← Вернуться в категорию
              </Link>

              <div className="d-flex align-items-center mb-3">
                <h3 className="mb-0">{product.price} ₽</h3>
                <Badge bg="success" className="ms-3">В наличии</Badge>
              </div>

              <Card.Text className="flex-grow-1">
                {product.description || 'Описание отсутствует'}
              </Card.Text>

              <div className="d-grid gap-2 d-md-flex">
                <Button
                  variant={isItemInCart ? "success" : "primary"}
                  size="lg"
                  className="me-md-2 mb-2"
                  onClick={handleCartAction}
                  disabled={isItemInCart}
                >
                  {isItemInCart ? 'В корзине ✓' : 'Добавить в корзину'}
                </Button>
                <Button
                  variant={isAuthenticated ? (isFav ? "danger" : "outline-secondary") : "outline-warning"}
                  size="lg"
                  onClick={handleFavouriteAction}
                  className="mb-2"
                >
                  {isAuthenticated ? (isFav ? 'В избранном ✓' : 'В избранное') : 'В избранное'}
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Секция с характеристиками товара */}
      <Row className="mt-4">
        <Col>
          <Card>
            <Card.Header as="h5">Характеристики</Card.Header>
            <Card.Body>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <strong>Категория:</strong> {product.category_id}
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>Артикул:</strong> {product.id}
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default memo(ProductPage);
