import React from 'react';
import { useNavigate } from 'react-router-dom';
import './styles.css';

const NotFound = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="notfound-container" data-easytag="id1-react/src/components/NotFound/index.jsx">
      <div className="notfound-content">
        <h1 className="notfound-title">404</h1>
        <h2 className="notfound-subtitle">Страница не найдена</h2>
        <p className="notfound-text">
          К сожалению, запрашиваемая страница не существует или была перемещена.
        </p>
        <button
          className="notfound-btn"
          onClick={handleGoHome}
          data-testid="notfound-home-btn"
        >
          Вернуться на главную
        </button>
      </div>
    </div>
  );
};

export default NotFound;
