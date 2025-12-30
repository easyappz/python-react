import React from 'react';

const UserInfo = ({ user, currentLanguage }) => {
  const translations = {
    ru: {
      title: 'Информация о пользователе',
      name: 'Имя',
      business: 'Название бизнеса',
      email: 'Email'
    },
    en: {
      title: 'User Information',
      name: 'Name',
      business: 'Business Name',
      email: 'Email'
    }
  };

  const t = translations[currentLanguage];

  return (
    <div className="profile-card">
      <h2 className="profile-section-title">{t.title}</h2>
      
      <div className="profile-info">
        <div className="info-item">
          <span className="info-label">{t.name}:</span>
          <span className="info-value" data-testid="profile-name">{user?.name || '-'}</span>
        </div>

        <div className="info-item">
          <span className="info-label">{t.business}:</span>
          <span className="info-value" data-testid="profile-business">{user?.business_name || '-'}</span>
        </div>

        <div className="info-item">
          <span className="info-label">{t.email}:</span>
          <span className="info-value" data-testid="profile-email">{user?.email || '-'}</span>
        </div>
      </div>
    </div>
  );
};

export default UserInfo;
