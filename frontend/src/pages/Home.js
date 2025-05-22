import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Card, Button, Row, Col, Spinner, Alert } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const Home = ({ isAuthenticated }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  if (loading) return <Spinner animation="border" className="d-block mx-auto my-5" />;

  if (error) return (
    <Alert variant="danger">
      {error}
      <div className="mt-2">
        <Button onClick={() => window.location.reload()}>Обновить</Button>
      </div>
    </Alert>
  );

  return (
    <div className="container py-4">
      <h1 className="text-center mb-4">Добро пожаловать!</h1>

      <Row>
        {categories.map(category => (
          <Col key={category.id} md={4} className="mb-4">
            <Card>
              {category.image_url && (
                <Card.Img variant="top" src={`http://localhost:8000${category.image_url}`} />
              )}
              <Card.Body>
                <Card.Title>{category.name}</Card.Title>
                <Button as={Link} to={`/category/${category.id}`} variant="primary">Перейти</Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default Home;