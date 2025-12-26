import React from 'react';
import './user-card.css';

const UserCard = ({ user, onWriteClick, onCardClick }) => {
  const getInitials = () => {
    const firstInitial = user.first_name ? user.first_name[0].toUpperCase() : '';
    const lastInitial = user.last_name ? user.last_name[0].toUpperCase() : '';
    return `${firstInitial}${lastInitial}`;
  };

  const handleCardClick = (e) => {
    if (e.target.closest('.user-card-write-btn')) {
      return;
    }
    if (onCardClick) {
      onCardClick(user.id);
    }
  };

  const handleWriteClick = (e) => {
    e.stopPropagation();
    if (onWriteClick) {
      onWriteClick(user.id);
    }
  };

  return (
    <div 
      className="user-card" 
      onClick={handleCardClick}
      data-easytag="id8-src/components/UserCard/index.jsx"
      data-testid="user-card"
    >
      <div className="user-card-avatar">
        {getInitials()}
      </div>
      <div className="user-card-info">
        <div className="user-card-name">
          {user.first_name} {user.last_name}
        </div>
      </div>
      {onWriteClick && (
        <button 
          className="user-card-write-btn"
          onClick={handleWriteClick}
          data-testid="write-button"
        >
          Написать
        </button>
      )}
    </div>
  );
};

export default UserCard;