import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserProfile, updateUserProfile } from '../../api/users';
import { getBoards } from '../../api/boards';
import { getCards } from '../../api/cards';
import { Header } from '../Header';
import toast from 'react-hot-toast';
import './styles.css';

export const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState('');
  const [avatar, setAvatar] = useState('');
  const [stats, setStats] = useState({ boards: 0, cards: 0 });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setIsLoading(true);
    try {
      const profileData = await getUserProfile();
      setProfile(profileData);
      setUsername(profileData.username);
      setAvatar(profileData.avatar || '');

      const boards = await getBoards();
      setStats(prev => ({ ...prev, boards: boards.length }));

      let totalCards = 0;
      for (const board of boards) {
        try {
          const cards = await getCards(board.id);
          totalCards += cards.length;
        } catch (error) {
          console.error('Error loading cards for board:', board.id);
        }
      }
      setStats(prev => ({ ...prev, cards: totalCards }));
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Ошибка загрузки профиля');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!username.trim()) {
      toast.error('Имя пользователя не может быть пустым');
      return;
    }

    if (username.length < 3) {
      toast.error('Имя пользователя должно содержать минимум 3 символа');
      return;
    }

    try {
      const updateData = { username };
      if (avatar) {
        updateData.avatar = avatar;
      }

      const updatedProfile = await updateUserProfile(updateData);
      setProfile(updatedProfile);
      setIsEditing(false);
      toast.success('Профиль успешно обновлен');
    } catch (error) {
      console.error('Error updating profile:', error);
      if (error.response?.data?.errors?.username) {
        toast.error(error.response.data.errors.username[0]);
      } else {
        toast.error('Ошибка обновления профиля');
      }
    }
  };

  const handleCancel = () => {
    setUsername(profile.username);
    setAvatar(profile.avatar || '');
    setIsEditing(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div data-easytag="id1-react/src/components/Profile/index.jsx">
        <Header />
        <div className="profile-loading">Загрузка профиля...</div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="profile-page" data-easytag="id2-react/src/components/Profile/index.jsx" data-testid="profile-page">
      <Header />
      <div className="profile-container">
        <div className="profile-header">
          <button
            className="profile-back-btn"
            onClick={() => navigate('/')}
            data-testid="back-to-dashboard-btn"
          >
            ← Назад к доскам
          </button>
          <h1>Мой профиль</h1>
        </div>

        <div className="profile-content">
          <div className="profile-main">
            <div className="profile-avatar-section">
              {avatar || profile.avatar ? (
                <img
                  src={avatar || profile.avatar}
                  alt="Avatar"
                  className="profile-avatar"
                  data-testid="profile-avatar"
                />
              ) : (
                <div className="profile-avatar-placeholder" data-testid="profile-avatar-placeholder">
                  {username.charAt(0).toUpperCase()}
                </div>
              )}
              {isEditing && (
                <input
                  type="text"
                  className="profile-avatar-input"
                  placeholder="URL аватара"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  data-testid="avatar-input"
                />
              )}
            </div>

            <div className="profile-info">
              <div className="profile-field">
                <label>Email</label>
                <div className="profile-value" data-testid="profile-email">{profile.email}</div>
              </div>

              <div className="profile-field">
                <label>Имя пользователя</label>
                {isEditing ? (
                  <input
                    type="text"
                    className="profile-input"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    data-testid="username-input"
                  />
                ) : (
                  <div className="profile-value" data-testid="profile-username">{profile.username}</div>
                )}
              </div>

              <div className="profile-field">
                <label>Дата регистрации</label>
                <div className="profile-value" data-testid="profile-created-at">
                  {formatDate(profile.created_at)}
                </div>
              </div>

              <div className="profile-actions">
                {isEditing ? (
                  <>
                    <button
                      className="profile-save-btn"
                      onClick={handleSave}
                      data-testid="save-profile-btn"
                    >
                      Сохранить
                    </button>
                    <button
                      className="profile-cancel-btn"
                      onClick={handleCancel}
                      data-testid="cancel-edit-btn"
                    >
                      Отмена
                    </button>
                  </>
                ) : (
                  <button
                    className="profile-edit-btn"
                    onClick={() => setIsEditing(true)}
                    data-testid="edit-profile-btn"
                  >
                    Редактировать профиль
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="profile-stats">
            <h2>Статистика</h2>
            <div className="stats-grid">
              <div className="stat-card" data-testid="stat-boards">
                <div className="stat-icon">📊</div>
                <div className="stat-value">{stats.boards}</div>
                <div className="stat-label">Досок</div>
              </div>
              <div className="stat-card" data-testid="stat-cards">
                <div className="stat-icon">📝</div>
                <div className="stat-value">{stats.cards}</div>
                <div className="stat-label">Карточек</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
