import React, { useContext, useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, ListGroup, Spinner, Alert, Badge } from 'react-bootstrap';
import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getCurrentUser } from '../services/auth';

const Cart = () => {
  const { cart, loading, error, removeFromCart, fetchCart } = useCart();
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();
  const isAuthenticated = !!getCurrentUser();

  useEffect(() => {
    if (cart?.items?.length > 0) {
      const fetchProducts = async () => {
        try {
          const response = await axios.get('http://localhost:8000/api/v1/products/', {
            params: { ids: cart.items.join(',') }
          });
          setProducts(response.data);

          // Вычисляем общую сумму
          const sum = response.data.reduce((acc, product) => acc + product.price, 0);
          setTotal(sum);
        } catch (err) {
          console.error('Ошибка загрузки товаров:', err);
        }
      };
      fetchProducts();
    } else {
      setProducts([]);
      setTotal(0);
    }
  }, [cart]);

  const handleRemove = async (productId) => {
    const success = await removeFromCart(productId);
    if (success) {
      // Обновляем список продуктов после удаления
      setProducts(products.filter(p => p.id !== productId));
    }
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/cart' } });
      return;
    }
    navigate('/checkout');
  };

  if (!isAuthenticated) {
    return (
      <Container className="py-4">
        <Alert variant="warning">
          Для просмотра корзины необходимо <Link to="/login">войти в систему</Link>
        </Alert>
      </Container>
    );
  }

  if (loading) return <Spinner animation="border" className="d-block mx-auto my-5" />;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <Container className="py-4">
      <h2 className="mb-4">Ваша корзина</h2>

      {products.length === 0 ? (
        <Card>
          <Card.Body>
            <Card.Text>Ваша корзина пуста</Card.Text>
            <Link to="/" className="btn btn-primary">
              Перейти к покупкам
            </Link>
          </Card.Body>
        </Card>
      ) : (
        <Row>
          <Col md={8}>
            <ListGroup>
              {products.map(product => (
                <ListGroup.Item key={product.id} className="d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center">
                    <img
                      src={product.main_image ? `http://localhost:8000${product.main_image}` : '/placeholder-image.jpg'}
                      alt={product.name}
                      style={{ width: '80px', height: '80px', objectFit: 'contain', marginRight: '20px' }} />
                    <div>
                      <h5>{product.name}</h5>
                      <div>{product.price} ₽</div>
                    </div>
                  </div>
                  <Button variant="outline-danger" size="sm" onClick={() => handleRemove(product.id)}>Удалить</Button>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Col>

          <Col md={4}>
            <Card>
              <Card.Body>
                <Card.Title>Итого</Card.Title>
                <ListGroup variant="flush">
                  <ListGroup.Item className="d-flex justify-content-between">
                    <span>Товары ({products.length})</span>
                    <span>{total} ₽</span>
                  </ListGroup.Item>
                  <ListGroup.Item className="d-flex justify-content-between">
                    <strong>Общая сумма</strong>
                    <strong>{total} ₽</strong>
                  </ListGroup.Item>
                </ListGroup>
                <Button variant="primary" className="w-100 mt-3" onClick={handleCheckout}>Оформить заказ</Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default Cart;