import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { logout } from '../../api/auth';
import './styles.css';

const Reports = () => {
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
    <div data-easytag="id5-react/src/components/Reports/index.jsx" className="reports-container">
      <header className="reports-header">
        <div className="reports-header-content">
          <h1 className="reports-logo">FinOps</h1>
          <nav className="reports-nav">
            <button onClick={() => navigate('/')} className="nav-link">
              Главная
            </button>
            <button onClick={() => navigate('/reports')} className="nav-link active">
              Отчеты
            </button>
            <button onClick={() => navigate('/profile')} className="nav-link">
              Профиль
            </button>
            <button onClick={handleLogout} className="logout-button">
              Выйти
            </button>
          </nav>
        </div>
      </header>

      <main className="reports-main">
        <h2 className="reports-title">Отчеты и аналитика</h2>
        <p className="reports-subtitle">Анализ финансовых показателей вашего бизнеса</p>

        <div className="reports-grid">
          <div className="report-card">
            <h3 className="report-card-title">📊 Финансовый отчет</h3>
            <p className="report-card-description">Полный анализ доходов и расходов</p>
            <button className="report-button">Сформировать</button>
          </div>

          <div className="report-card">
            <h3 className="report-card-title">💰 Отчет по прибыли</h3>
            <p className="report-card-description">Динамика чистой прибыли</p>
            <button className="report-button">Сформировать</button>
          </div>

          <div className="report-card">
            <h3 className="report-card-title">🏛️ Налоговый отчет</h3>
            <p className="report-card-description">Расчет налоговых обязательств</p>
            <button className="report-button">Сформировать</button>
          </div>

          <div className="report-card">
            <h3 className="report-card-title">📈 Отчет по эффективности</h3>
            <p className="report-card-description">Ключевые показатели бизнеса</p>
            <button className="report-button">Сформировать</button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Reports;
