import React, { useState } from 'react';
import { updateCard } from '../../api/cards';
import toast from 'react-hot-toast';

export const Description = ({ card, onUpdate }) => {
  const [description, setDescription] = useState(card.description || '');
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = async () => {
    try {
      await updateCard(card.id, { description });
      toast.success('Описание обновлено');
      setIsEditing(false);
      onUpdate();
    } catch (error) {
      console.error('Error updating description:', error);
      toast.error('Ошибка обновления описания');
    }
  };

  const handleCancel = () => {
    setDescription(card.description || '');
    setIsEditing(false);
  };

  return (
    <div className="card-modal-section" data-easytag="id1-react/src/components/CardModal/Description.jsx">
      <h3 className="card-modal-section-title">Описание</h3>
      {isEditing ? (
        <div className="description-edit">
          <textarea
            className="description-textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Добавьте более подробное описание..."
            rows={6}
            autoFocus
            data-testid="description-textarea"
          />
          <div className="description-actions">
            <button
              className="btn-save"
              onClick={handleSave}
              data-testid="save-description-btn"
            >
              Сохранить
            </button>
            <button
              className="btn-cancel"
              onClick={handleCancel}
              data-testid="cancel-description-btn"
            >
              Отмена
            </button>
          </div>
        </div>
      ) : (
        <div
          className="description-view"
          onClick={() => setIsEditing(true)}
          data-testid="description-view"
        >
          {description || 'Нажмите, чтобы добавить описание...'}
        </div>
      )}

      <style>{`
        .card-modal-section {
          margin-bottom: 24px;
        }

        .card-modal-section-title {
          font-size: 16px;
          font-weight: 600;
          color: #333;
          margin-bottom: 12px;
        }

        .description-view {
          background: #f5f5f5;
          border-radius: 4px;
          padding: 12px;
          min-height: 80px;
          cursor: pointer;
          color: #333;
          white-space: pre-wrap;
          transition: background 0.2s;
        }

        .description-view:hover {
          background: #e0e0e0;
        }

        .description-textarea {
          width: 100%;
          border: 2px solid #0079bf;
          border-radius: 4px;
          padding: 12px;
          font-size: 14px;
          font-family: inherit;
          resize: vertical;
          outline: none;
        }

        .description-actions {
          margin-top: 12px;
          display: flex;
          gap: 8px;
        }

        .btn-save {
          background: #0079bf;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 8px 16px;
          cursor: pointer;
          font-size: 14px;
          transition: background 0.2s;
        }

        .btn-save:hover {
          background: #026aa7;
        }

        .btn-cancel {
          background: #f5f5f5;
          color: #333;
          border: none;
          border-radius: 4px;
          padding: 8px 16px;
          cursor: pointer;
          font-size: 14px;
          transition: background 0.2s;
        }

        .btn-cancel:hover {
          background: #e0e0e0;
        }
      `}</style>
    </div>
  );
};
