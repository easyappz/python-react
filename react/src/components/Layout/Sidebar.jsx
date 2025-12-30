import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './styles.css';

const Sidebar = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊', testId: 'nav-link-dashboard' },
    { path: '/transactions', label: 'Транзакции', icon: '💰', testId: 'nav-link-transactions' },
    { path: '/reports', label: 'Отчеты', icon: '📈', testId: 'nav-link-reports' },
    { path: '/profile', label: 'Профиль', icon: '👤', testId: 'nav-link-profile' }
  ];

  return (
    <aside className="sidebar" data-easytag="id1-react/src/components/Layout/Sidebar.jsx" data-testid="sidebar">
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
            data-testid={item.testId}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-label">{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
