import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, Button, Row, Col, Spinner, Alert } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

/**
 * Компонент главной страницы
 * Отображает:
 * - Приветственное сообщение
 * - Список категорий товаров
 * - Состояния загрузки и ошибки
 *
 */
const Home = ({ isAuthenticated }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Загрузка категорий при монтировании компонента
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/v1/categories');
        setCategories(response.data);
      } catch (err) {
        setError(`Ошибка загрузки: ${err.message}`);
        console.error('Детали ошибки:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Обработчик клика по категории
  const handleCategoryClick = (categoryId) => {
    navigate(`/category/${categoryId}`);
  };

  // Состояние загрузки
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  // Состояние ошибки
  if (error) {
    return (
      <Alert variant="danger" className="text-center">
        {error}
        <div className="mt-3">
          <Button variant="outline-danger" onClick={() => window.location.reload()}>
            Обновить страницу
          </Button>
        </div>
      </Alert>
    );
  }

  return (
    <div className="container py-4">
      <h1 className="text-center mb-4">Добро пожаловать в наш магазин!</h1>
      <p className="text-center text-muted mb-5">
        Выберите интересующую вас категорию товаров
      </p>

      <Row xs={1} sm={2} lg={3} className="g-4">
        {categories.map(category => (
          <Col key={category.id}>
            {/* Карточка категории - вся кликабельна */}
            <Card
              className="h-100 shadow-sm hover-shadow transition-all"
              onClick={() => handleCategoryClick(category.id)}
              style={{ cursor: 'pointer' }}
            >
              {/* Кликабельное изображение категории */}
              <div
                style={{ height: '460px', overflow: 'hidden' }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleCategoryClick(category.id);
                }}
              >
                <Card.Img
                  variant="top"
                  src={category.image_url
                    ? `http://localhost:8000${category.image_url}`
                    : '/placeholder-category.jpg'}
                  alt={category.name}
                  className="h-100 w-100 object-fit-cover"
                  onError={(e) => {
                    e.target.src = '/placeholder-category.jpg';
                  }}
                />
              </div>

              <Card.Body className="d-flex flex-column">
                <Card.Title className="text-center fs-4 mb-3">
                  {category.name}
                </Card.Title>

                {/* Кнопка для семантики и доступности */}
                <Button
                  variant="outline-primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCategoryClick(category.id);
                  }}
                  className="mt-auto"
                >
                  Перейти в категорию
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default Home;