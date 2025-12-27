import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { registerUser } from '../../api/auth';
import toast from 'react-hot-toast';

export const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    password_confirm: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (formData.password !== formData.password_confirm) {
      toast.error('Пароли не совпадают');
      setLoading(false);
      return;
    }

    try {
      const userData = await registerUser(formData);
      login(userData);
      toast.success('Регистрация успешна!');
      navigate('/');
    } catch (error) {
      const errors = error.response?.data?.errors;
      if (errors) {
        Object.values(errors).forEach((errorArray) => {
          errorArray.forEach((msg) => toast.error(msg));
        });
      } else {
        toast.error('Ошибка регистрации');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div data-easytag="id1-react/src/components/Register/index.jsx" style={{
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#f5f5f5',
      padding: '20px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
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
          textAlign: 'center',
        }}>
          {t('register')}
        </h1>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              color: '#555',
              marginBottom: '8px',
            }}>
              {t('email')}
            </label>
            <input
              type="email"
              name="email"
              data-testid="register-email"
              value={formData.email}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              color: '#555',
              marginBottom: '8px',
            }}>
              {t('username')}
            </label>
            <input
              type="text"
              name="username"
              data-testid="register-username"
              value={formData.username}
              onChange={handleChange}
              required
              minLength={3}
              maxLength={150}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              color: '#555',
              marginBottom: '8px',
            }}>
              {t('password')}
            </label>
            <input
              type="password"
              name="password"
              data-testid="register-password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={8}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ marginBottom: '30px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              color: '#555',
              marginBottom: '8px',
            }}>
              {t('passwordConfirm')}
            </label>
            <input
              type="password"
              name="password_confirm"
              data-testid="register-password-confirm"
              value={formData.password_confirm}
              onChange={handleChange}
              required
              minLength={8}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <button
            type="submit"
            data-testid="register-submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '16px',
              fontWeight: '600',
              color: '#fff',
              backgroundColor: loading ? '#ccc' : '#0079bf',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Загрузка...' : t('register')}
          </button>
        </form>

        <div style={{
          marginTop: '20px',
          textAlign: 'center',
          fontSize: '14px',
          color: '#666',
        }}>
          Уже есть аккаунт?{' '}
          <Link to="/login" style={{ color: '#0079bf', textDecoration: 'none' }}>
            {t('login')}
          </Link>
        </div>
      </div>
    </div>
  );
};
