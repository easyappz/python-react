import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './sidebar.css';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const menuItems = [
    { id: 'profile', label: 'Моя страница', path: '/profile', icon: '👤' },
    { id: 'dialogs', label: 'Сообщения', path: '/dialogs', icon: '💬' },
    { id: 'search', label: 'Поиск', path: '/search', icon: '🔍' },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <aside className="vk-sidebar" data-easytag="id4-src/components/Sidebar/index.jsx">
      <nav className="vk-sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`vk-sidebar-item ${isActive(item.path) ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <span className="vk-sidebar-icon">{item.icon}</span>
            <span className="vk-sidebar-label">{item.label}</span>
          </button>
        ))}
        <button
          className="vk-sidebar-item"
          onClick={handleLogout}
        >
          <span className="vk-sidebar-icon">🚪</span>
          <span className="vk-sidebar-label">Выход</span>
        </button>
      </nav>
    </aside>
  );
};

export default Sidebar;
