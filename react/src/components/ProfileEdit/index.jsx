import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { updateMember } from '../../api/members';
import Layout from '../Layout';
import './profile-edit.css';

const ProfileEdit = () => {
  const navigate = useNavigate();
  const { user, checkAuth } = useAuth();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      setLoading(true);
      await updateMember(user.id, formData);
      await checkAuth();
      navigate('/profile');
    } catch (err) {
      setError(err.response?.data?.error || 'Не удалось обновить профиль');
      console.error('Error updating profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/profile');
  };

  return (
    <Layout>
      <div className="vk-profile-edit" data-easytag="id6-src/components/ProfileEdit/index.jsx">
        <div className="vk-profile-edit-card">
          <h2 className="vk-profile-edit-title">Редактирование профиля</h2>
          <form onSubmit={handleSubmit} className="vk-profile-edit-form">
            <div className="vk-form-group">
              <label className="vk-form-label">Имя</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className="vk-input"
                placeholder="Введите имя"
                data-testid="first-name-input"
              />
            </div>
            <div className="vk-form-group">
              <label className="vk-form-label">Фамилия</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className="vk-input"
                placeholder="Введите фамилию"
                data-testid="last-name-input"
              />
            </div>
            {error && <div className="vk-error-message">{error}</div>}
            <div className="vk-profile-edit-actions">
              <button
                type="submit"
                className="vk-button"
                disabled={loading}
                data-testid="save-button"
              >
                {loading ? 'Сохранение...' : 'Сохранить'}
              </button>
              <button
                type="button"
                className="vk-button-secondary"
                onClick={handleCancel}
                disabled={loading}
                data-testid="cancel-button"
              >
                Отмена
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default ProfileEdit;
