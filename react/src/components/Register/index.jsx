import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../../api/auth';

export const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password || !firstName || !lastName) {
      setError('Все поля обязательны для заполнения');
      return;
    }

    if (password.length < 8) {
      setError('Пароль должен содержать минимум 8 символов');
      return;
    }

    try {
      await register(email, password, firstName, lastName);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка регистрации');
    }
  };

  return (
    <div className="auth-container" data-easytag="id1-src/components/Register/index.jsx">
      <div className="auth-card">
        <h1 className="auth-title" data-testid="register-title">Регистрация</h1>
        <form onSubmit={handleSubmit} className="auth-form">
          {error && (
            <div className="auth-error" data-testid="register-error">
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
              data-testid="register-email-input"
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
              data-testid="register-password-input"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="firstName" className="form-label">
              Имя
            </label>
            <input
              id="firstName"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="form-input"
              data-testid="register-firstname-input"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="lastName" className="form-label">
              Фамилия
            </label>
            <input
              id="lastName"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="form-input"
              data-testid="register-lastname-input"
              required
            />
          </div>
          <button type="submit" className="auth-button" data-testid="register-submit-button">
            Зарегистрироваться
          </button>
        </form>
      </div>
    </div>
  );
};
