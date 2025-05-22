import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
  Card,
  Row,
  Col,
  Spinner,
  Alert,
  Container,
  Button,
  Breadcrumb
} from 'react-bootstrap';

/**
 * Компонент страницы категории
 * Отображает:
 * - Название категории
 * - Хлебные крошки для навигации
 * - Список товаров в категории
 * - Состояния загрузки и ошибки
 *
 */
const CategoryPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Загрузка данных категории и товаров
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Параллельная загрузка данных категории и товаров
        const [categoryRes, productsRes] = await Promise.all([
          axios.get(`http://localhost:8000/api/v1/categories/${id}`),
          axios.get(`http://localhost:8000/api/v1/products?category_id=${id}`)
        ]);

        setCategory(categoryRes.data);
        setProducts(productsRes.data);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
        console.error('Ошибка загрузки данных:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Обработчик клика по карточке товара
  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  // Состояния загрузки
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  // Обработка ошибок
  if (error) {
    return (
      <Container className="py-4">
        <Alert variant="danger" className="text-center">
          Ошибка загрузки данных: {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">

      {/* Заголовок категории */}
      <h1 className="mb-4">{category?.name || 'Категория'}</h1>

      {/* Список товаров */}
      {products.length === 0 ? (
        <Alert variant="info" className="text-center">
          В этой категории пока нет товаров
        </Alert>
      ) : (
        <Row xs={1} sm={2} md={3} lg={4} className="g-4">
          {products.map(product => (
            <Col key={product.id}>
              {/* Карточка товара - вся кликабельна */}
              <Card
                className="h-100 shadow-sm hover-shadow transition-all"
                onClick={() => handleProductClick(product.id)}
                style={{ cursor: 'pointer' }}
              >
                {/* Изображение товара */}
                <div style={{ height: '200px', overflow: 'hidden' }}>
                  <Card.Img
                    variant="top"
                    src={product.main_image
                      ? `http://localhost:8000${product.main_image}`
                      : '/placeholder-product.jpg'}
                    alt={product.name}
                    className="h-100 w-100 object-fit-cover"
                    onError={(e) => {
                      e.target.src = '/placeholder-product.jpg';
                    }}
                  />
                </div>

                <Card.Body className="d-flex flex-column">
                  <Card.Title className="fs-5 mb-2">{product.name}</Card.Title>
                  <Card.Text className="fw-bold text-primary mt-auto">
                    {product.price.toLocaleString()} ₽
                  </Card.Text>

                  {/* Кнопка - для семантики и доступности */}
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation(); // Предотвращаем всплытие
                      handleProductClick(product.id);
                    }}
                  >
                    Подробнее
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default CategoryPage;