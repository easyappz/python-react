import React from 'react';
import { useNavigate } from 'react-router-dom';
import './styles.css';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div data-easytag="id7-react/src/components/NotFound/index.jsx" className="notfound-container">
      <div className="notfound-content">
        <h1 className="notfound-title">404</h1>
        <h2 className="notfound-subtitle">Страница не найдена</h2>
        <p className="notfound-description">
          К сожалению, запрашиваемая страница не существует.
        </p>
        <button onClick={() => navigate('/')} className="notfound-button">
          Вернуться на главную
        </button>
      </div>
    </div>
  );
};

export default NotFound;
