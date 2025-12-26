import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { updateProfile } from '../../api/profile';

export const Profile = () => {
  const { user, setUser, loading } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
    if (user) {
      setFirstName(user.first_name || '');
      setLastName(user.last_name || '');
    }
  }, [user, loading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!firstName || !lastName) {
      setError('Все поля обязательны для заполнения');
      return;
    }

    try {
      const updatedUser = await updateProfile(firstName, lastName);
      setUser(updatedUser);
      setSuccess('Профиль успешно обновлен');
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка обновления профиля');
    }
  };

  if (loading) {
    return <div className="loading">Загрузка...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="profile-container" data-easytag="id1-src/components/Profile/index.jsx">
      <div className="profile-card">
        <h1 className="profile-title" data-testid="profile-title">Профиль</h1>
        {error && (
          <div className="profile-error" data-testid="profile-error">
            {error}
          </div>
        )}
        {success && (
          <div className="profile-success" data-testid="profile-success">
            {success}
          </div>
        )}
        {!isEditing ? (
          <div className="profile-info">
            <div className="profile-field">
              <span className="profile-label">Email:</span>
              <span className="profile-value" data-testid="profile-email">
                {user.email}
              </span>
            </div>
            <div className="profile-field">
              <span className="profile-label">Имя:</span>
              <span className="profile-value" data-testid="profile-firstname">
                {user.first_name}
              </span>
            </div>
            <div className="profile-field">
              <span className="profile-label">Фамилия:</span>
              <span className="profile-value" data-testid="profile-lastname">
                {user.last_name}
              </span>
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="profile-button"
              data-testid="profile-edit-button"
            >
              Редактировать
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={user.email}
                className="form-input"
                disabled
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
                data-testid="profile-firstname-input"
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
                data-testid="profile-lastname-input"
                required
              />
            </div>
            <div className="profile-buttons">
              <button type="submit" className="profile-button" data-testid="profile-save-button">
                Сохранить
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setFirstName(user.first_name);
                  setLastName(user.last_name);
                  setError('');
                }}
                className="profile-button-secondary"
                data-testid="profile-cancel-button"
              >
                Отмена
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
