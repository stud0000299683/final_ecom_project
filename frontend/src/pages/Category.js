import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Card, Row, Col, Spinner, Alert, Container, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const CategoryPage = () => {
  const { id } = useParams();
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoryRes, productsRes] = await Promise.all([
          axios.get(`http://localhost:8000/api/v1/categories/${id}`),
          axios.get(`http://localhost:8000/api/v1/products?category_id=${id}`)
        ]);

        setCategory(categoryRes.data);
        setProducts(productsRes.data);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) return <Spinner animation="border" className="d-block mx-auto my-5" />;
  if (error) return <Alert variant="danger">Ошибка: {error}</Alert>;

  return (
    <Container className="py-4">
      <h1 className="mb-4">{category?.name || 'Категория'}</h1>

      {products.length === 0 ? (
        <Alert variant="info">В этой категории пока нет товаров</Alert>
      ) : (
        <Row>
          {products.map(product => (
            <Col key={product.id} md={4} className="mb-4">
              <Card className="h-100">
                {product.main_image && (
                  <Card.Img
                    variant="top"
                    src={`http://localhost:8000${product.main_image}`}
                    alt={product.name}
                    style={{ height: '200px', objectFit: 'cover' }}
                  />
                )}
                <Card.Body>
                  <Card.Title>{product.name}</Card.Title>
                  <Card.Text>{product.price} ₽ </Card.Text>
                  <Button as={Link} to={`/product/${product.id}`} variant="primary">Подробнее</Button>
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