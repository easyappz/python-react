import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { registerUser } from '../../api/auth';
import toast from 'react-hot-toast';
import { Header } from '../Header';
import './styles.css';

export const Register = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const { language, t } = useLanguage();
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    password_confirm: '',
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

    if (!formData.username) {
      newErrors.username = language === 'ru' ? 'Имя пользователя обязательно' : 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = language === 'ru' ? 'Минимум 3 символа' : 'Minimum 3 characters';
    }

    if (!formData.password) {
      newErrors.password = language === 'ru' ? 'Пароль обязателен' : 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = language === 'ru' ? 'Минимум 8 символов' : 'Minimum 8 characters';
    }

    if (!formData.password_confirm) {
      newErrors.password_confirm = language === 'ru' ? 'Подтвердите пароль' : 'Confirm password';
    } else if (formData.password !== formData.password_confirm) {
      newErrors.password_confirm = language === 'ru' ? 'Пароли не совпадают' : 'Passwords do not match';
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
      const userData = await registerUser(formData);
      login(userData);
      toast.success(language === 'ru' ? 'Регистрация успешна' : 'Registration successful');
      navigate('/');
    } catch (error) {
      if (error.response?.data?.errors) {
        const serverErrors = {};
        Object.keys(error.response.data.errors).forEach((key) => {
          serverErrors[key] = error.response.data.errors[key][0];
        });
        setErrors(serverErrors);
      } else {
        toast.error(language === 'ru' ? 'Ошибка регистрации' : 'Registration error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page" data-easytag="id1-react/src/components/Register/index.jsx">
      <Header />
      <div className="register-container">
        <div className="register-box">
          <h1 className="register-title" data-testid="register-title">{t('register')}</h1>
          <form onSubmit={handleSubmit} className="register-form" data-testid="register-form">
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
                data-testid="register-email"
              />
              {errors.email && (
                <span className="error-message" data-testid="error-email">{errors.email}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="username" className="form-label">
                {t('username')}
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className={`form-input ${errors.username ? 'error' : ''}`}
                placeholder={language === 'ru' ? 'Введите имя пользователя' : 'Enter username'}
                data-testid="register-username"
              />
              {errors.username && (
                <span className="error-message" data-testid="error-username">{errors.username}</span>
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
                data-testid="register-password"
              />
              {errors.password && (
                <span className="error-message" data-testid="error-password">{errors.password}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password_confirm" className="form-label">
                {t('passwordConfirm')}
              </label>
              <input
                type="password"
                id="password_confirm"
                name="password_confirm"
                value={formData.password_confirm}
                onChange={handleChange}
                className={`form-input ${errors.password_confirm ? 'error' : ''}`}
                placeholder={language === 'ru' ? 'Подтвердите пароль' : 'Confirm password'}
                data-testid="register-password-confirm"
              />
              {errors.password_confirm && (
                <span className="error-message" data-testid="error-password-confirm">{errors.password_confirm}</span>
              )}
            </div>

            <button
              type="submit"
              className="submit-button"
              disabled={loading}
              data-testid="register-submit"
            >
              {loading ? (language === 'ru' ? 'Регистрация...' : 'Registering...') : t('register')}
            </button>
          </form>

          <div className="register-footer">
            <p className="footer-text">
              {language === 'ru' ? 'Уже есть аккаунт?' : 'Already have an account?'}{' '}
              <Link to="/login" className="footer-link" data-testid="login-link">
                {t('login')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
