import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Все поля обязательны для заполнения');
      return;
    }

    try {
      const userData = await login(email, password);
      setUser(userData);
      navigate('/profile');
    } catch (err) {
      setError(err.response?.data?.error || 'Неверные учетные данные');
    }
  };

  return (
    <div className="auth-container" data-easytag="id1-src/components/Login/index.jsx">
      <div className="auth-card">
        <h1 className="auth-title" data-testid="login-title">Вход</h1>
        <form onSubmit={handleSubmit} className="auth-form">
          {error && (
            <div className="auth-error" data-testid="login-error">
              {error}
            </div>
          )}
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              data-testid="login-email-input"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Пароль
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              data-testid="login-password-input"
              required
            />
          </div>
          <button type="submit" className="auth-button" data-testid="login-submit-button">
            Войти
          </button>
        </form>
      </div>
    </div>
  );
};
