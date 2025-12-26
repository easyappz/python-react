import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getMember } from '../../api/members';
import { createDialog } from '../../api/dialogs';
import Layout from '../Layout';
import './profile.css';

const Profile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isOwnProfile = !id || parseInt(id) === user?.id;
  const profileId = id ? parseInt(id) : user?.id;

  useEffect(() => {
    const fetchProfile = async () => {
      if (!profileId) return;

      try {
        setLoading(true);
        setError(null);
        const data = await getMember(profileId);
        setProfile(data);
      } catch (err) {
        setError('Не удалось загрузить профиль');
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [profileId]);

  const handleEdit = () => {
    navigate('/profile/edit');
  };

  const handleSendMessage = async () => {
    try {
      const dialog = await createDialog(profile.id);
      navigate(`/dialogs/${dialog.id}`);
    } catch (err) {
      console.error('Error creating dialog:', err);
      alert('Не удалось создать диалог');
    }
  };

  const getInitials = (firstName, lastName) => {
    const first = firstName ? firstName[0].toUpperCase() : '';
    const last = lastName ? lastName[0].toUpperCase() : '';
    return first + last || '?';
  };

  if (loading) {
    return (
      <Layout>
        <div className="vk-profile-loading">Загрузка...</div>
      </Layout>
    );
  }

  if (error || !profile) {
    return (
      <Layout>
        <div className="vk-profile-error">{error || 'Профиль не найден'}</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="vk-profile" data-easytag="id5-src/components/Profile/index.jsx">
        <div className="vk-profile-card">
          <div className="vk-profile-header">
            <div className="vk-profile-avatar">
              {getInitials(profile.first_name, profile.last_name)}
            </div>
            <div className="vk-profile-info">
              <h1 className="vk-profile-name">
                {profile.first_name} {profile.last_name}
              </h1>
              <div className="vk-profile-status">Online</div>
            </div>
          </div>
          <div className="vk-profile-actions">
            {isOwnProfile ? (
              <button
                className="vk-profile-button"
                onClick={handleEdit}
                data-testid="edit-profile-button"
              >
                Редактировать
              </button>
            ) : (
              <button
                className="vk-profile-button"
                onClick={handleSendMessage}
                data-testid="send-message-button"
              >
                Написать сообщение
              </button>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
