import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { logout } from '../../api/auth';

export const Header = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="header" data-easytag="id1-src/components/Header/index.jsx">
      <div className="header-container">
        <Link to="/" className="header-logo" data-testid="header-logo">
          Главная
        </Link>
        <nav className="header-nav">
          {user ? (
            <>
              <Link to="/profile" className="header-link" data-testid="header-profile-link">
                Профиль
              </Link>
              <button
                onClick={handleLogout}
                className="header-button"
                data-testid="header-logout-button"
              >
                Выйти
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="header-link" data-testid="header-login-link">
                Войти
              </Link>
              <Link to="/register" className="header-link" data-testid="header-register-link">
                Регистрация
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};
