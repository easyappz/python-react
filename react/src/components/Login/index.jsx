import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { loginUser } from '../../api/auth';
import toast from 'react-hot-toast';
import { Header } from '../Header';
import './styles.css';

export const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const { language, t } = useLanguage();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = language === 'ru' ? 'Email обязателен' : 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = language === 'ru' ? 'Некорректный email' : 'Invalid email';
    }

    if (!formData.password) {
      newErrors.password = language === 'ru' ? 'Пароль обязателен' : 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const userData = await loginUser({
        email: formData.email,
        password: formData.password,
      });
      login(userData);
      toast.success(language === 'ru' ? 'Вход выполнен успешно' : 'Login successful');
      navigate('/');
    } catch (error) {
      if (error.response?.data?.detail) {
        toast.error(error.response.data.detail);
      } else {
        toast.error(language === 'ru' ? 'Ошибка входа' : 'Login error');
      }
      setErrors({ general: error.response?.data?.detail || 'Login failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page" data-easytag="id1-react/src/components/Login/index.jsx">
      <Header />
      <div className="login-container">
        <div className="login-box">
          <h1 className="login-title" data-testid="login-title">{t('login')}</h1>
          <form onSubmit={handleSubmit} className="login-form" data-testid="login-form">
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                {t('email')}
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`form-input ${errors.email ? 'error' : ''}`}
                placeholder={language === 'ru' ? 'Введите email' : 'Enter email'}
                data-testid="login-email"
              />
              {errors.email && (
                <span className="error-message" data-testid="error-email">{errors.email}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                {t('password')}
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`form-input ${errors.password ? 'error' : ''}`}
                placeholder={language === 'ru' ? 'Введите пароль' : 'Enter password'}
                data-testid="login-password"
              />
              {errors.password && (
                <span className="error-message" data-testid="error-password">{errors.password}</span>
              )}
            </div>

            {errors.general && (
              <div className="error-message general" data-testid="error-general">
                {errors.general}
              </div>
            )}

            <button
              type="submit"
              className="submit-button"
              disabled={loading}
              data-testid="login-submit"
            >
              {loading ? (language === 'ru' ? 'Вход...' : 'Logging in...') : t('login')}
            </button>
          </form>

          <div className="login-footer">
            <p className="footer-text">
              {language === 'ru' ? 'Нет аккаунта?' : "Don't have an account?"}{' '}
              <Link to="/register" className="footer-link" data-testid="register-link">
                {t('register')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
