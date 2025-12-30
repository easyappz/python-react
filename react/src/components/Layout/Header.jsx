import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './styles.css';

const Header = ({ onMenuToggle }) => {
  const { user, setUser, setIsAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    setIsAuthenticated(false);
    navigate('/login');
  };

  const navItems = [
    { path: '/', label: 'Dashboard', testId: 'nav-link-dashboard' },
    { path: '/transactions', label: 'Транзакции', testId: 'nav-link-transactions' },
    { path: '/reports', label: 'Отчеты', testId: 'nav-link-reports' },
    { path: '/profile', label: 'Профиль', testId: 'nav-link-profile' }
  ];

  return (
    <header className="header" data-easytag="id1-react/src/components/Layout/Header.jsx" data-testid="header">
      <div className="header-container">
        <div className="header-left">
          <button
            className="mobile-menu-toggle"
            onClick={onMenuToggle}
            data-testid="mobile-menu-toggle"
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
          <div className="header-logo">
            <h1>FinOps</h1>
          </div>
        </div>

        <nav className="header-nav desktop-only">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
              data-testid={item.testId}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="header-right">
          {user && (
            <div className="user-info">
              <span className="user-name">{user.username || user.email}</span>
            </div>
          )}
          <button
            className="logout-btn"
            onClick={handleLogout}
            data-testid="header-logout-btn"
          >
            Выход
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
