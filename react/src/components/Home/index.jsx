import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

export const Home = () => {
  const { user } = useAuth();

  return (
    <div className="home-container" data-easytag="id1-src/components/Home/index.jsx">
      <div className="home-content">
        <h1 className="home-title" data-testid="home-title">
          Добро пожаловать
        </h1>
        {user ? (
          <div className="home-user-info">
            <p className="home-text" data-testid="home-welcome-text">
              Здравствуйте, {user.first_name} {user.last_name}!
            </p>
            <Link to="/profile" className="home-link" data-testid="home-profile-link">
              Перейти в профиль
            </Link>
          </div>
        ) : (
          <div className="home-guest-info">
            <p className="home-text" data-testid="home-guest-text">
              Пожалуйста, войдите или зарегистрируйтесь
            </p>
            <div className="home-links">
              <Link to="/login" className="home-link" data-testid="home-login-link">
                Войти
              </Link>
              <Link to="/register" className="home-link" data-testid="home-register-link">
                Регистрация
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
