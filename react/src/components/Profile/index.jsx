import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { logoutUser } from '../../api/auth';
import toast from 'react-hot-toast';

export const Profile = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { t } = useLanguage();

  const handleLogout = async () => {
    try {
      await logoutUser();
      logout();
      toast.success('Вы вышли из аккаунта');
      navigate('/login');
    } catch (error) {
      toast.error('Ошибка выхода');
    }
  };

  return (
    <div data-easytag="id1-react/src/components/Profile/index.jsx" style={{
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      padding: '40px 20px',
    }}>
      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
        backgroundColor: '#fff',
        padding: '40px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}>
        <h1 style={{
          fontSize: '28px',
          fontWeight: '600',
          color: '#333',
          marginBottom: '30px',
        }}>
          {t('profile')}
        </h1>

        <div style={{ marginBottom: '20px' }}>
          <div style={{
            fontSize: '14px',
            color: '#666',
            marginBottom: '5px',
          }}>
            {t('username')}
          </div>
          <div style={{
            fontSize: '18px',
            color: '#333',
            fontWeight: '500',
          }}>
            {user?.username}
          </div>
        </div>

        <div style={{ marginBottom: '30px' }}>
          <div style={{
            fontSize: '14px',
            color: '#666',
            marginBottom: '5px',
          }}>
            {t('email')}
          </div>
          <div style={{
            fontSize: '18px',
            color: '#333',
            fontWeight: '500',
          }}>
            {user?.email}
          </div>
        </div>

        <button
          data-testid="logout-button"
          onClick={handleLogout}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            fontWeight: '600',
            color: '#fff',
            backgroundColor: '#d9534f',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          {t('logout')}
        </button>
      </div>
    </div>
  );
};
