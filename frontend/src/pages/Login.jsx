import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button, Form, Alert, Card, Tab, Tabs } from 'react-bootstrap';
import { login } from '../services/auth';
import axios from 'axios';

const API_URL = 'http://localhost:8000/api/v1';


const Login = ({ onLogin }) => {
  const [activeTab, setActiveTab] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login(username, password);
      onLogin();
      navigate(location.state?.from || '/', { replace: true });
    } catch (err) {
      setError(err.message || 'Неверный логин или пароль');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/users/`, {
        username,
        password,
        email,
        first_name: firstName,
        last_name: lastName,
        is_active: true
      });

      // Автовход после регистрации
      await login(username, password);
      onLogin();
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Ошибка регистрации');
    }
  };

  return (
    <div className="container py-5">
      <Card className="mx-auto" style={{ maxWidth: '500px' }}>
        <Card.Body>
          <Tabs activeKey={activeTab} onSelect={(k) => {setActiveTab(k); setError('');}} className="mb-3">
            <Tab eventKey="login" title="Вход">
              <h2 className="mb-4">Вход в систему</h2>
              {error && activeTab === 'login' && <Alert variant="danger">{error}</Alert>}
              <Form onSubmit={handleLogin}>
                <Form.Group className="mb-3">
                  <Form.Label>Имя пользователя</Form.Label>
                  <Form.Control type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Пароль</Form.Label>
                  <Form.Control type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </Form.Group>
                <Button variant="primary" type="submit" className="w-100">Войти</Button>
              </Form>
            </Tab>

            <Tab eventKey="register" title="Регистрация">
              <h2 className="mb-4">Регистрация</h2>
              {error && activeTab === 'register' && <Alert variant="danger">{error}</Alert>}
              <Form onSubmit={handleRegister}>
                <Form.Group className="mb-3">
                  <Form.Label>Имя пользователя</Form.Label>
                  <Form.Control type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                    required
                    minLength={3}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Пароль</Form.Label>
                  <Form.Control type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control type="email" value={email} onChange={(e) => setEmail(e.target.value)}required />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Имя</Form.Label>
                  <Form.Control type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)}required />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Фамилия</Form.Label>
                  <Form.Control type="text" value={lastName} onChange={(e) => setLastName(e.target.value)}required/>
                </Form.Group>
                <Button variant="success" type="submit" className="w-100">Зарегистрироваться</Button>
              </Form>
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Login;