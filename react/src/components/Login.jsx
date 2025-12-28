import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const translations = {
  ru: {
    title: 'Вход в систему',
    subtitle: 'Войдите в свой аккаунт FinOps',
    email: 'Email',
    emailPlaceholder: 'example@company.com',
    password: 'Пароль',
    passwordPlaceholder: 'Введите пароль',
    loginButton: 'Войти',
    noAccount: 'Нет аккаунта?',
    registerLink: 'Зарегистрироваться',
    invalidCredentials: 'Неверный email или пароль',
    serverError: 'Ошибка сервера. Попробуйте позже',
    requiredFields: 'Заполните все поля'
  },
  en: {
    title: 'Sign In',
    subtitle: 'Sign in to your FinOps account',
    email: 'Email',
    emailPlaceholder: 'example@company.com',
    password: 'Password',
    passwordPlaceholder: 'Enter password',
    loginButton: 'Sign In',
    noAccount: 'Don\'t have an account?',
    registerLink: 'Register',
    invalidCredentials: 'Invalid email or password',
    serverError: 'Server error. Try again later',
    requiredFields: 'Fill in all fields'
  }
};

function Login() {
  const navigate = useNavigate();
  const { setUser, setIsAuthenticated } = useAuth();
  const [lang] = useState('ru');
  const t = translations[lang];

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError(t.requiredFields);
      return;
    }

    setLoading(true);

    try {
      const userData = await login({
        email: formData.email,
        password: formData.password
      });
      
      setUser(userData);
      setIsAuthenticated(true);
      navigate('/');
    } catch (err) {
      if (err.response?.status === 401) {
        setError(t.invalidCredentials);
      } else if (err.response?.status === 400) {
        setError(err.response?.data?.message || t.requiredFields);
      } else {
        setError(t.serverError);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container" data-easytag="id2-react/src/components/Login.jsx">
      <div className="login-card">
        <div className="login-header">
          <h1>{t.title}</h1>
          <p>{t.subtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="error-message" data-testid="login-error-message">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">{t.email}</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder={t.emailPlaceholder}
              disabled={loading}
              data-testid="login-email-input"
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">{t.password}</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder={t.passwordPlaceholder}
              disabled={loading}
              data-testid="login-password-input"
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={loading}
            data-testid="login-submit-btn"
          >
            {loading ? '...' : t.loginButton}
          </button>
        </form>

        <div className="login-footer">
          <p>
            {t.noAccount}{' '}
            <Link to="/register" data-testid="register-link">{t.registerLink}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;