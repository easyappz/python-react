import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import './Register.css';

const translations = {
  ru: {
    title: 'Регистрация',
    subtitle: 'Создайте аккаунт FinOps',
    name: 'Имя',
    namePlaceholder: 'Иван Иванов',
    businessName: 'Название бизнеса',
    businessNamePlaceholder: 'ООО "Компания"',
    email: 'Email',
    emailPlaceholder: 'example@company.com',
    password: 'Пароль',
    passwordPlaceholder: 'Минимум 8 символов',
    confirmPassword: 'Подтвердите пароль',
    confirmPasswordPlaceholder: 'Повторите пароль',
    registerButton: 'Зарегистрироваться',
    hasAccount: 'Уже есть аккаунт?',
    loginLink: 'Войти',
    requiredFields: 'Заполните все поля',
    passwordMismatch: 'Пароли не совпадают',
    passwordTooShort: 'Пароль должен содержать минимум 8 символов',
    emailExists: 'Пользователь с таким email уже существует',
    serverError: 'Ошибка сервера. Попробуйте позже'
  },
  en: {
    title: 'Register',
    subtitle: 'Create your FinOps account',
    name: 'Name',
    namePlaceholder: 'John Doe',
    businessName: 'Business Name',
    businessNamePlaceholder: 'Company LLC',
    email: 'Email',
    emailPlaceholder: 'example@company.com',
    password: 'Password',
    passwordPlaceholder: 'Minimum 8 characters',
    confirmPassword: 'Confirm Password',
    confirmPasswordPlaceholder: 'Repeat password',
    registerButton: 'Register',
    hasAccount: 'Already have an account?',
    loginLink: 'Sign In',
    requiredFields: 'Fill in all fields',
    passwordMismatch: 'Passwords do not match',
    passwordTooShort: 'Password must be at least 8 characters',
    emailExists: 'User with this email already exists',
    serverError: 'Server error. Try again later'
  }
};

function Register() {
  const navigate = useNavigate();
  const { setUser, setIsAuthenticated } = useAuth();
  const [lang] = useState('ru');
  const t = translations[lang];

  const [formData, setFormData] = useState({
    name: '',
    business_name: '',
    email: '',
    password: '',
    confirmPassword: ''
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

    if (!formData.name || !formData.business_name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError(t.requiredFields);
      return;
    }

    if (formData.password.length < 8) {
      setError(t.passwordTooShort);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError(t.passwordMismatch);
      return;
    }

    setLoading(true);

    try {
      const userData = await register({
        name: formData.name,
        business_name: formData.business_name,
        email: formData.email,
        password: formData.password
      });
      
      setUser(userData);
      setIsAuthenticated(true);
      navigate('/');
    } catch (err) {
      if (err.response?.status === 409) {
        setError(t.emailExists);
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
    <div className="register-container" data-easytag="id3-react/src/components/Register.jsx">
      <div className="register-card">
        <div className="register-header">
          <h1>{t.title}</h1>
          <p>{t.subtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          {error && (
            <div className="error-message" data-testid="register-error-message">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="name">{t.name}</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder={t.namePlaceholder}
              disabled={loading}
              data-testid="register-name-input"
              autoComplete="name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="business_name">{t.businessName}</label>
            <input
              type="text"
              id="business_name"
              name="business_name"
              value={formData.business_name}
              onChange={handleChange}
              placeholder={t.businessNamePlaceholder}
              disabled={loading}
              data-testid="register-business-input"
              autoComplete="organization"
            />
          </div>

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
              data-testid="register-email-input"
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
              data-testid="register-password-input"
              autoComplete="new-password"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">{t.confirmPassword}</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder={t.confirmPasswordPlaceholder}
              disabled={loading}
              data-testid="register-confirm-password-input"
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            className="register-button"
            disabled={loading}
            data-testid="register-submit-btn"
          >
            {loading ? '...' : t.registerButton}
          </button>
        </form>

        <div className="register-footer">
          <p>
            {t.hasAccount}{' '}
            <Link to="/login" data-testid="login-link">{t.loginLink}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;