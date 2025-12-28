import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../api/auth';
import './styles.css';

const Dashboard = () => {
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
    <div data-easytag="id4-react/src/components/Dashboard/index.jsx" className="dashboard-container">
      <header className="dashboard-header">
        <div className="dashboard-header-content">
          <h1 className="dashboard-logo">FinOps</h1>
          <nav className="dashboard-nav">
            <button onClick={() => navigate('/')} className="nav-link" data-testid="nav-dashboard">
              Главная
            </button>
            <button onClick={() => navigate('/reports')} className="nav-link" data-testid="nav-reports">
              Отчеты
            </button>
            <button onClick={() => navigate('/profile')} className="nav-link" data-testid="nav-profile">
              Профиль
            </button>
            <button onClick={handleLogout} className="logout-button" data-testid="logout-button">
              Выйти
            </button>
          </nav>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="welcome-section">
          <h2 className="welcome-title">Добро пожаловать, {user?.name}!</h2>
          <p className="welcome-subtitle">{user?.business_name}</p>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-card">
            <div className="card-icon" style={{ backgroundColor: '#48bb78' }}>💰</div>
            <h3 className="card-title">Доходы</h3>
            <p className="card-value">0 ₽</p>
            <p className="card-description">Общий доход за период</p>
          </div>

          <div className="dashboard-card">
            <div className="card-icon" style={{ backgroundColor: '#f56565' }}>📉</div>
            <h3 className="card-title">Расходы</h3>
            <p className="card-value">0 ₽</p>
            <p className="card-description">Общие расходы за период</p>
          </div>

          <div className="dashboard-card">
            <div className="card-icon" style={{ backgroundColor: '#ed8936' }}>🏛️</div>
            <h3 className="card-title">Налоги</h3>
            <p className="card-value">0 ₽</p>
            <p className="card-description">Налоговые обязательства</p>
          </div>

          <div className="dashboard-card">
            <div className="card-icon" style={{ backgroundColor: '#667eea' }}>📊</div>
            <h3 className="card-title">Чистая прибыль</h3>
            <p className="card-value">0 ₽</p>
            <p className="card-description">Прибыль после вычета расходов</p>
          </div>

          <div className="dashboard-card">
            <div className="card-icon" style={{ backgroundColor: '#38b2ac' }}>💸</div>
            <h3 className="card-title">Денежный поток</h3>
            <p className="card-value">0 ₽</p>
            <p className="card-description">Движение денежных средств</p>
          </div>

          <div className="dashboard-card">
            <div className="card-icon" style={{ backgroundColor: '#9f7aea' }}>📈</div>
            <h3 className="card-title">Эффективность</h3>
            <p className="card-value">0%</p>
            <p className="card-description">Показатель эффективности бизнеса</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
