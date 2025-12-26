import React from 'react';
import './message.css';

const Message = ({ message, isOwn }) => {
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div
      className={`message ${isOwn ? 'message-own' : 'message-other'}`}
      data-easytag="id11-src/components/Message/index.jsx"
      data-testid="message-item"
    >
      <div className="message-bubble">
        <div className="message-text">{message.text}</div>
        <div className="message-time">{formatTime(message.created_at)}</div>
      </div>
    </div>
  );
};

export default Message;
