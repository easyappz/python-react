import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './styles.css';

const MobileMenu = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setUser, setIsAuthenticated } = useAuth();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊', testId: 'nav-link-dashboard' },
    { path: '/transactions', label: 'Транзакции', icon: '💰', testId: 'nav-link-transactions' },
    { path: '/reports', label: 'Отчеты', icon: '📈', testId: 'nav-link-reports' },
    { path: '/profile', label: 'Профиль', icon: '👤', testId: 'nav-link-profile' }
  ];

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    setIsAuthenticated(false);
    onClose();
    navigate('/login');
  };

  const handleLinkClick = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="mobile-menu-overlay" onClick={onClose}></div>
      <div className="mobile-menu" data-easytag="id1-react/src/components/Layout/MobileMenu.jsx">
        <nav className="mobile-menu-nav">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`mobile-menu-link ${location.pathname === item.path ? 'active' : ''}`}
              onClick={handleLinkClick}
              data-testid={item.testId}
            >
              <span className="mobile-menu-icon">{item.icon}</span>
              <span className="mobile-menu-label">{item.label}</span>
            </Link>
          ))}
          <button
            className="mobile-menu-logout"
            onClick={handleLogout}
            data-testid="header-logout-btn"
          >
            Выход
          </button>
        </nav>
      </div>
    </>
  );
};

export default MobileMenu;
