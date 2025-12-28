import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';
import './styles.css';

const Register = () => {
  const navigate = useNavigate();
  const { setUser, setIsAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    business_name: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password.length < 8) {
      setError('Пароль должен содержать минимум 8 символов');
      return;
    }

    setIsLoading(true);

    try {
      const userData = await register(formData);
      setUser(userData);
      setIsAuthenticated(true);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка регистрации. Попробуйте снова.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div data-easytag="id3-react/src/components/Register/index.jsx" className="register-container">
      <div className="register-card">
        <h1 className="register-title">Регистрация в FinOps</h1>
        <p className="register-subtitle">Создайте аккаунт для управления финансами</p>

        {error && (
          <div className="error-message" data-testid="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <label htmlFor="name">Ваше имя</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={isLoading}
              data-testid="register-name-input"
              placeholder="Иван Иванов"
            />
          </div>

          <div className="form-group">
            <label htmlFor="business_name">Название бизнеса</label>
            <input
              type="text"
              id="business_name"
              name="business_name"
              value={formData.business_name}
              onChange={handleChange}
              required
              disabled={isLoading}
              data-testid="register-business-input"
              placeholder="ООО Моя компания"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={isLoading}
              data-testid="register-email-input"
              placeholder="example@mail.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Пароль (минимум 8 символов)</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={8}
              disabled={isLoading}
              data-testid="register-password-input"
              placeholder="Введите пароль"
            />
          </div>

          <button
            type="submit"
            className="register-button"
            disabled={isLoading}
            data-testid="register-submit-button"
          >
            {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
          </button>
        </form>

        <div className="register-footer">
          <p>
            Уже есть аккаунт?{' '}
            <Link to="/login" data-testid="login-link">
              Войти
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
