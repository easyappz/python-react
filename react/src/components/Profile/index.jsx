import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { logout } from '../../api/auth';
import './styles.css';

const Profile = () => {
  const { user, setUser, setIsAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      setIsAuthenticated(false);
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div data-easytag="id6-react/src/components/Profile/index.jsx" className="profile-container">
      <header className="profile-header">
        <div className="profile-header-content">
          <h1 className="profile-logo">FinOps</h1>
          <nav className="profile-nav">
            <button onClick={() => navigate('/')} className="nav-link">
              Главная
            </button>
            <button onClick={() => navigate('/reports')} className="nav-link">
              Отчеты
            </button>
            <button onClick={() => navigate('/profile')} className="nav-link active">
              Профиль
            </button>
            <button onClick={handleLogout} className="logout-button">
              Выйти
            </button>
          </nav>
        </div>
      </header>

      <main className="profile-main">
        <div className="profile-card">
          <h2 className="profile-title">Профиль пользователя</h2>
          
          <div className="profile-info">
            <div className="info-item">
              <span className="info-label">Имя:</span>
              <span className="info-value">{user?.name}</span>
            </div>

            <div className="info-item">
              <span className="info-label">Email:</span>
              <span className="info-value">{user?.email}</span>
            </div>

            <div className="info-item">
              <span className="info-label">Название бизнеса:</span>
              <span className="info-value">{user?.business_name}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
