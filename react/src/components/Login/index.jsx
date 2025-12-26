import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/vk-theme.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Пожалуйста, заполните все поля');
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      navigate('/profile');
    } catch (err) {
      setError(err.response?.data?.error || 'Неверный email или пароль');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="vk-page" data-easytag="id1-src/components/Login/index.jsx">
      <div className="vk-container">
        <div className="vk-logo">
          <Link to="/" className="vk-logo-text">VK</Link>
        </div>
        <div className="vk-card">
          <h1 className="vk-title">Вход ВКонтакте</h1>
          <form className="vk-form" onSubmit={handleSubmit}>
            <input
              type="email"
              className="vk-input"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              data-testid="login-email-input"
            />
            <input
              type="password"
              className="vk-input"
              placeholder="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              data-testid="login-password-input"
            />
            {error && <div className="vk-error-message" data-testid="login-error-message">{error}</div>}
            <button
              type="submit"
              className="vk-button"
              disabled={loading}
              data-testid="login-submit-button"
            >
              {loading ? 'Вход...' : 'Войти'}
            </button>
          </form>
          <div className="vk-link">
            Нет аккаунта? <Link to="/register" data-testid="login-register-link">Зарегистрироваться</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
