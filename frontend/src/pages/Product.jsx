import React, { useState, useEffect, useContext, useMemo, useCallback, memo } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import {
  Container, Row, Col, Card, Spinner, Alert, Button,
  Carousel, Badge, ListGroup, Toast
} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FavouritesContext } from '../context/FavouritesContext';

// Выносим компонент изображений отдельно
const ProductImages = memo(({ mainImage, additionalImages, onImageClick }) => {
  return (
    <Card className="mb-4">
      {mainImage && (
        <Card.Img
          variant="top"
          src={`http://localhost:8000${mainImage}`}
          alt="Main product"
          style={{ maxHeight: '500px', objectFit: 'contain' }}
          className="p-3"
        />
      )}
      {additionalImages.length > 0 && (
        <Carousel className="mt-2" indicators={false}>
          {additionalImages.map((img, index) => (
            <Carousel.Item key={index}>
              <img
                className="d-block w-100"
                src={`http://localhost:8000${img}`}
                alt={`Additional ${index + 1}`}
                style={{ height: '200px', objectFit: 'contain' }}
                onClick={() => onImageClick(img)}
              />
            </Carousel.Item>
          ))}
        </Carousel>
      )}
    </Card>
  );
});

const ProductPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mainImage, setMainImage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const { addToFavourites, removeFromFavourites, isFavourite } = useContext(FavouritesContext);

  // Переносим все хуки до любого условного рендеринга
  const productData = useMemo(() => {
    return product ? {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.main_image,
      category_id: product.category_id
    } : null;
  }, [product]);

  const checkIsFavourite = useCallback(() => {
    return product ? isFavourite(product.id) : false;
  }, [product, isFavourite]);

  const isFav = checkIsFavourite(); // Используем как переменную, а не состояние

  const fetchProduct = useCallback(async () => {
    try {
      const response = await axios.get(`http://localhost:8000/api/v1/products/${id}`);
      setProduct(response.data);
      setMainImage(response.data.main_image || '');
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const toggleFavourite = useCallback(() => {
    if (!product) return;

    if (isFav) {
      removeFromFavourites(product.id);
      setToastMessage('Товар удален из избранного');
    } else {
      addToFavourites(productData);
      setToastMessage('Товар добавлен в избранное');
    }
    setShowToast(true);
  }, [isFav, product, productData, addToFavourites, removeFromFavourites]);

  const handleImageClick = useCallback((img) => {
    setMainImage(img);
  }, []);

  const additionalImages = useMemo(() =>
    product?.additional_images_urls || [],
    [product?.additional_images_urls]
  );

  // Условный рендеринг только после всех хуков
  if (loading) return <Spinner animation="border" className="d-block mx-auto my-5" />;
  if (error) return <Alert variant="danger">Ошибка: {error}</Alert>;
  if (!product) return <Alert variant="warning">Товар не найден</Alert>;

  return (
    <Container className="py-4">
      <Toast
        onClose={() => setShowToast(false)}
        show={showToast}
        delay={3000}
        autohide
        style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999 }}
      >
        <Toast.Header>
          <strong className="me-auto">Избранное</strong>
        </Toast.Header>
        <Toast.Body>{toastMessage}</Toast.Body>
      </Toast>

      <Row>
        <Col md={6}>
          <ProductImages
            mainImage={mainImage}
            additionalImages={additionalImages}
            onImageClick={handleImageClick}
          />
        </Col>

        <Col md={6}>
          <Card className="mb-4 h-100">
            <Card.Body className="d-flex flex-column">
              <Card.Title as="h2">{product.name}</Card.Title>

              <div className="mb-3">
                <Link
                  to={`/category/${product.category_id}`}
                  className="text-muted text-decoration-none"
                >
                  ← Вернуться в категорию
                </Link>
              </div>

              <div className="d-flex align-items-center mb-3">
                <h3 className="mb-0">{product.price} ₽</h3>
                <Badge bg="success" className="ms-3">В наличии</Badge>
              </div>

              <Card.Text className="flex-grow-1">
                {product.description || 'Описание отсутствует'}
              </Card.Text>

              <div className="d-grid gap-2 d-md-flex">
                <Button variant="primary" size="lg" className="me-md-2 mb-2">
                  Добавить в корзину
                </Button>
                <Button
                  variant={isFav ? "danger" : "outline-secondary"}
                  size="lg"
                  onClick={toggleFavourite}
                  className="mb-2"
                >
                  {isFav ? 'В избранном ✓' : 'В избранное'}
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

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