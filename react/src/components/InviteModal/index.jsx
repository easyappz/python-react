import React, { useState, useEffect } from 'react';
import { inviteToBoard } from '../../api/boards';
import { getCurrentUser } from '../../api/auth';
import toast from 'react-hot-toast';
import './styles.css';

export const InviteModal = ({ isOpen, onClose, board, onInviteSuccess }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [members, setMembers] = useState([]);

  useEffect(() => {
    if (isOpen && board) {
      setMembers(board.members || []);
    }
  }, [isOpen, board]);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleInvite = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error('Введите email');
      return;
    }

    if (!validateEmail(email)) {
      toast.error('Введите корректный email');
      return;
    }

    setIsLoading(true);
    try {
      await inviteToBoard(board.id, email);
      toast.success('Приглашение отправлено');
      setEmail('');
      if (onInviteSuccess) {
        onInviteSuccess();
      }
    } catch (error) {
      console.error('Error inviting user:', error);
      if (error.response?.status === 404) {
        toast.error('Пользователь не найден');
      } else if (error.response?.status === 400) {
        toast.error('Пользователь уже добавлен');
      } else if (error.response?.status === 403) {
        toast.error('Недостаточно прав для приглашения');
      } else {
        toast.error('Ошибка отправки приглашения');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    toast('Удаление участников будет доступно позже');
  };

  if (!isOpen) return null;

  return (
    <div className="invite-modal-overlay" onClick={onClose} data-easytag="id1-react/src/components/InviteModal/index.jsx">
      <div className="invite-modal" onClick={(e) => e.stopPropagation()} data-testid="invite-modal">
        <div className="invite-modal-header">
          <h2>Пригласить участников</h2>
          <button className="invite-modal-close" onClick={onClose} data-testid="close-invite-modal">
            ×
          </button>
        </div>

        <div className="invite-modal-body">
          <form onSubmit={handleInvite} className="invite-form">
            <div className="invite-form-group">
              <label htmlFor="email">Email пользователя</label>
              <input
                type="email"
                id="email"
                className="invite-input"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                data-testid="invite-email-input"
              />
            </div>
            <button
              type="submit"
              className="invite-submit-btn"
              disabled={isLoading}
              data-testid="send-invite-btn"
            >
              {isLoading ? 'Отправка...' : 'Отправить приглашение'}
            </button>
          </form>

          {members.length > 0 && (
            <div className="invite-members-list">
              <h3>Участники доски</h3>
              <div className="members-list">
                {members.map((member) => (
                  <div key={member.id} className="member-item" data-testid={`member-${member.id}`}>
                    <div className="member-info">
                      {member.avatar ? (
                        <img src={member.avatar} alt={member.username} className="member-avatar" />
                      ) : (
                        <div className="member-avatar-placeholder">
                          {member.username.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="member-details">
                        <div className="member-name">{member.username}</div>
                        <div className="member-email">{member.email}</div>
                      </div>
                    </div>
                    {board.owner !== member.id && (
                      <button
                        className="member-remove-btn"
                        onClick={() => handleRemoveMember(member.id)}
                        data-testid={`remove-member-${member.id}`}
                      >
                        Удалить
                      </button>
                    )}
                    {board.owner === member.id && (
                      <span className="member-owner-badge">Владелец</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
