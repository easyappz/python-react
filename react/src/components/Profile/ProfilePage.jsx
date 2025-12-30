import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getSettings } from '../../api/settings';
import UserInfo from './UserInfo';
import SettingsForm from './SettingsForm';
import CategoriesManager from './CategoriesManager';
import './styles.css';

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentLanguage, setCurrentLanguage] = useState('ru');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await getSettings();
      setSettings(data);
      setCurrentLanguage(data.language || 'ru');
    } catch (err) {
      console.error('Error loading settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSettingsUpdate = async () => {
    await loadSettings();
  };

  const handleLanguageChange = (newLanguage) => {
    setCurrentLanguage(newLanguage);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="profile-page" data-easytag="id4-react/src/components/Profile/ProfilePage.jsx">
        <div className="profile-container">
          <div className="loading-message">Загрузка...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page" data-easytag="id4-react/src/components/Profile/ProfilePage.jsx">
      <div className="profile-container">
        <div className="profile-header">
          <h1>Профиль</h1>
          <button
            className="btn-secondary"
            onClick={handleLogout}
            data-testid="profile-logout-btn"
          >
            Выход
          </button>
        </div>

        <div className="profile-content">
          <UserInfo user={user} currentLanguage={currentLanguage} />
          
          <SettingsForm
            settings={settings}
            onSettingsUpdate={handleSettingsUpdate}
            currentLanguage={currentLanguage}
            onLanguageChange={handleLanguageChange}
          />
          
          <CategoriesManager currentLanguage={currentLanguage} />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
