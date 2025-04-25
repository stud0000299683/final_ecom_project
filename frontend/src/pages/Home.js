import React from 'react';

const Home = ({ isAuthenticated }) => {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Приветствуем тебя на главной странице нашего магазина</h1>
      {isAuthenticated ? (
        <p>Ура ты прошел авторизацию!</p>
      ) : (
        <p>Пожалуйста авторизуйся.</p>
      )}
    </div>
  );
};

export default Home;