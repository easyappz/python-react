import React, { useState, useEffect } from 'react';
import { updateCard, deleteCard } from '../../api/cards';
import { Description } from './Description';
import { Checklist } from './Checklist';
import { Comments } from './Comments';
import { Labels } from './Labels';
import { DueDate } from './DueDate';
import { Attachments } from './Attachments';
import toast from 'react-hot-toast';
import './styles.css';

export const CardModal = ({ card, boardId, onClose, onUpdate }) => {
  const [title, setTitle] = useState(card.title);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [activeTab, setActiveTab] = useState('description');

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleTitleSave = async () => {
    if (!title.trim()) {
      toast.error('Название не может быть пустым');
      setTitle(card.title);
      setIsEditingTitle(false);
      return;
    }

    try {
      await updateCard(card.id, { title: title.trim() });
      toast.success('Название обновлено');
      setIsEditingTitle(false);
      onUpdate();
    } catch (error) {
      console.error('Error updating title:', error);
      toast.error('Ошибка обновления названия');
      setTitle(card.title);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Вы уверены, что хотите удалить эту карточку?')) {
      return;
    }

    try {
      await deleteCard(card.id);
      toast.success('Карточка удалена');
      onClose();
      onUpdate();
    } catch (error) {
      console.error('Error deleting card:', error);
      toast.error('Ошибка удаления карточки');
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target.className === 'card-modal-backdrop') {
      onClose();
    }
  };

  return (
    <div
      className="card-modal-backdrop"
      onClick={handleBackdropClick}
      data-easytag="id1-react/src/components/CardModal/index.jsx"
      data-testid="card-modal"
    >
      <div className="card-modal">
        <div className="card-modal-header">
          <div className="card-modal-title-section">
            {isEditingTitle ? (
              <input
                type="text"
                className="card-modal-title-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleTitleSave}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleTitleSave();
                  if (e.key === 'Escape') {
                    setTitle(card.title);
                    setIsEditingTitle(false);
                  }
                }}
                autoFocus
                data-testid="card-title-input"
              />
            ) : (
              <h2
                className="card-modal-title"
                onClick={() => setIsEditingTitle(true)}
                data-testid="card-title"
              >
                {title}
              </h2>
            )}
          </div>
          <button
            className="card-modal-close"
            onClick={onClose}
            data-testid="close-modal-btn"
          >
            ✕
          </button>
        </div>

        <div className="card-modal-tabs">
          <button
            className={`card-modal-tab ${activeTab === 'description' ? 'active' : ''}`}
            onClick={() => setActiveTab('description')}
            data-testid="tab-description"
          >
            Описание
          </button>
          <button
            className={`card-modal-tab ${activeTab === 'labels' ? 'active' : ''}`}
            onClick={() => setActiveTab('labels')}
            data-testid="tab-labels"
          >
            Метки
          </button>
          <button
            className={`card-modal-tab ${activeTab === 'duedate' ? 'active' : ''}`}
            onClick={() => setActiveTab('duedate')}
            data-testid="tab-duedate"
          >
            Дедлайн
          </button>
          <button
            className={`card-modal-tab ${activeTab === 'checklists' ? 'active' : ''}`}
            onClick={() => setActiveTab('checklists')}
            data-testid="tab-checklists"
          >
            Чек-листы
          </button>
          <button
            className={`card-modal-tab ${activeTab === 'attachments' ? 'active' : ''}`}
            onClick={() => setActiveTab('attachments')}
            data-testid="tab-attachments"
          >
            Вложения
          </button>
          <button
            className={`card-modal-tab ${activeTab === 'comments' ? 'active' : ''}`}
            onClick={() => setActiveTab('comments')}
            data-testid="tab-comments"
          >
            Комментарии
          </button>
        </div>

        <div className="card-modal-content">
          {activeTab === 'description' && (
            <Description card={card} onUpdate={onUpdate} />
          )}
          {activeTab === 'labels' && (
            <Labels card={card} boardId={boardId} onUpdate={onUpdate} />
          )}
          {activeTab === 'duedate' && (
            <DueDate card={card} onUpdate={onUpdate} />
          )}
          {activeTab === 'checklists' && (
            <Checklist cardId={card.id} />
          )}
          {activeTab === 'attachments' && (
            <Attachments cardId={card.id} />
          )}
          {activeTab === 'comments' && (
            <Comments cardId={card.id} />
          )}
        </div>

        <div className="card-modal-footer">
          <button
            className="card-modal-delete-btn"
            onClick={handleDelete}
            data-testid="delete-card-btn"
          >
            🗑️ Удалить карточку
          </button>
        </div>
      </div>
    </div>
  );
};
