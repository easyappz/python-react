import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/vk-theme.css';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password || !firstName || !lastName) {
      setError('Пожалуйста, заполните все поля');
      return;
    }

    if (password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      return;
    }

    try {
      setLoading(true);
      await register(email, password, firstName, lastName);
      navigate('/profile');
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка регистрации. Возможно, пользователь уже существует');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="vk-page" data-easytag="id2-src/components/Register/index.jsx">
      <div className="vk-container">
        <div className="vk-logo">
          <Link to="/" className="vk-logo-text">VK</Link>
        </div>
        <div className="vk-card">
          <h1 className="vk-title">Регистрация</h1>
          <form className="vk-form" onSubmit={handleSubmit}>
            <div className="vk-form-row">
              <input
                type="text"
                className="vk-input"
                placeholder="Имя"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                disabled={loading}
                data-testid="register-firstname-input"
              />
              <input
                type="text"
                className="vk-input"
                placeholder="Фамилия"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                disabled={loading}
                data-testid="register-lastname-input"
              />
            </div>
            <input
              type="email"
              className="vk-input"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              data-testid="register-email-input"
            />
            <input
              type="password"
              className="vk-input"
              placeholder="Пароль (минимум 6 символов)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              data-testid="register-password-input"
            />
            {error && <div className="vk-error-message" data-testid="register-error-message">{error}</div>}
            <button
              type="submit"
              className="vk-button"
              disabled={loading}
              data-testid="register-submit-button"
            >
              {loading ? 'Регистрация...' : 'Зарегистрироваться'}
            </button>
          </form>
          <div className="vk-link">
            Уже есть аккаунт? <Link to="/login" data-testid="register-login-link">Войти</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
