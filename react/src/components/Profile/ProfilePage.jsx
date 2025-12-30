import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { logout } from '../../api/auth';
import UserInfo from './UserInfo';
import SettingsForm from './SettingsForm';
import CategoriesManager from './CategoriesManager';
import { getSettings } from '../../api/settings';
import './styles.css';

const ProfilePage = () => {
  const { user, setUser, setIsAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentLanguage, setCurrentLanguage] = useState(
    localStorage.getItem('app_language') || 'ru'
  );

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await getSettings();
      setSettings(data);
      if (data.language) {
        setCurrentLanguage(data.language);
        localStorage.setItem('app_language', data.language);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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

  const handleLanguageChange = (newLanguage) => {
    setCurrentLanguage(newLanguage);
    localStorage.setItem('app_language', newLanguage);
    window.location.reload();
  };

  const translations = {
    ru: {
      title: 'FinOps',
      home: 'Главная',
      reports: 'Отчеты',
      transactions: 'Транзакции',
      profile: 'Профиль',
      logout: 'Выйти',
      pageTitle: 'Профиль',
      loading: 'Загрузка...',
      error: 'Ошибка'
    },
    en: {
      title: 'FinOps',
      home: 'Home',
      reports: 'Reports',
      transactions: 'Transactions',
      profile: 'Profile',
      logout: 'Logout',
      pageTitle: 'Profile',
      loading: 'Loading...',
      error: 'Error'
    }
  };

  const t = translations[currentLanguage];

  if (loading) {
    return (
      <div className="profile-container">
        <div className="profile-loading">{t.loading}</div>
      </div>
    );
  }

  return (
    <div data-easytag="id4-react/src/components/Profile/ProfilePage.jsx" className="profile-container">
      <header className="profile-header">
        <div className="profile-header-content">
          <h1 className="profile-logo">{t.title}</h1>
          <nav className="profile-nav">
            <button onClick={() => navigate('/')} className="nav-link">
              {t.home}
            </button>
            <button onClick={() => navigate('/transactions')} className="nav-link">
              {t.transactions}
            </button>
            <button onClick={() => navigate('/reports')} className="nav-link">
              {t.reports}
            </button>
            <button onClick={() => navigate('/profile')} className="nav-link active">
              {t.profile}
            </button>
            <button 
              onClick={handleLogout} 
              className="logout-button"
              data-testid="profile-logout-btn"
            >
              {t.logout}
            </button>
          </nav>
        </div>
      </header>

      <main className="profile-main">
        {error && <div className="error-message">{t.error}: {error}</div>}
        
        <UserInfo user={user} currentLanguage={currentLanguage} />
        
        <SettingsForm 
          settings={settings} 
          onSettingsUpdate={loadSettings}
          currentLanguage={currentLanguage}
          onLanguageChange={handleLanguageChange}
        />
        
        <CategoriesManager currentLanguage={currentLanguage} />
      </main>
    </div>
  );
};

export default ProfilePage;
