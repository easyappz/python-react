import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { logoutUser } from '../../api/auth';
import toast from 'react-hot-toast';
import './styles.css';

export const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logoutUser();
      logout();
      toast.success(language === 'ru' ? 'Вы вышли из системы' : 'Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error(language === 'ru' ? 'Ошибка при выходе' : 'Logout error');
    }
  };

  return (
    <header className="header" data-easytag="id1-react/src/components/Header/index.jsx">
      <div className="header-container">
        <Link to="/" className="header-logo" data-testid="header-logo">
          <span className="logo-text">Trello Clone</span>
        </Link>

        <nav className="header-nav">
          {isAuthenticated && (
            <>
              <Link to="/" className="nav-link" data-testid="nav-dashboard">
                {t('myBoards')}
              </Link>
              <Link to="/profile" className="nav-link" data-testid="nav-profile">
                {t('profile')}
              </Link>
            </>
          )}
        </nav>

        <div className="header-actions">
          <button
            onClick={toggleLanguage}
            className="language-toggle"
            data-testid="language-toggle"
            aria-label="Toggle language"
          >
            {language === 'ru' ? 'EN' : 'RU'}
          </button>

          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="logout-button"
              data-testid="logout-button"
            >
              {t('logout')}
            </button>
          ) : (
            <div className="auth-links">
              <Link to="/login" className="auth-link" data-testid="nav-login">
                {t('login')}
              </Link>
              <Link to="/register" className="auth-link register" data-testid="nav-register">
                {t('register')}
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
