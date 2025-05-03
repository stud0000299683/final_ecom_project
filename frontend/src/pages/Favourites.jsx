import React, { useContext } from 'react';
import {
  Card, Button, ListGroup, Container, Alert,
  Row, Col, Spinner
} from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FavouritesContext } from '../context/FavouritesContext';

const Favourites = () => {
  const { favourites, removeFromFavourites } = useContext(FavouritesContext);

  // Если данные еще не загружены
  if (favourites === null) {
    return (
      <Container className="d-flex justify-content-center my-5">
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h2 className="mb-4">Избранные товары</h2>

      {favourites.length === 0 ? (
        <Alert variant="info">
          Ваш список избранного пуст. <Link to="/">Вернуться к покупкам</Link>
        </Alert>
      ) : (
        <Row>
          {favourites.map((product) => (
            <Col key={product.id} md={4} className="mb-4">
              <Card className="h-100">
                {product.image && (
                  <Card.Img
                    variant="top"
                    src={`http://localhost:8000${product.image}`}
                    style={{ height: '200px', objectFit: 'cover' }}
                  />
                )}
                <Card.Body className="d-flex flex-column">
                  <Card.Title>{product.name}</Card.Title>
                  <ListGroup variant="flush">
                    <ListGroup.Item>Цена: {product.price} ₽</ListGroup.Item>
                    <ListGroup.Item>Категория: {product.category_id}</ListGroup.Item>
                  </ListGroup>
                  <div className="mt-auto d-flex gap-2">
                    <Button
                      as={Link}
                      to={`/product/${product.id}`}
                      variant="primary"
                    >
                      Подробнее
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => removeFromFavourites(product.id)}
                    >
                      Удалить
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default Favourites;