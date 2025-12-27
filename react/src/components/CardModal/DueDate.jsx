import React, { useState } from 'react';
import { updateCard } from '../../api/cards';
import toast from 'react-hot-toast';

export const DueDate = ({ card, onUpdate }) => {
  const [dueDate, setDueDate] = useState(
    card.due_date ? new Date(card.due_date).toISOString().slice(0, 16) : ''
  );

  const handleSave = async () => {
    try {
      await updateCard(card.id, {
        due_date: dueDate ? new Date(dueDate).toISOString() : null
      });
      toast.success('Дедлайн обновлен');
      onUpdate();
    } catch (error) {
      console.error('Error updating due date:', error);
      toast.error('Ошибка обновления дедлайна');
    }
  };

  const handleClear = async () => {
    try {
      await updateCard(card.id, { due_date: null });
      setDueDate('');
      toast.success('Дедлайн удален');
      onUpdate();
    } catch (error) {
      console.error('Error clearing due date:', error);
      toast.error('Ошибка удаления дедлайна');
    }
  };

  const isOverdue = card.due_date && new Date(card.due_date) < new Date();

  return (
    <div className="card-modal-section" data-easytag="id1-react/src/components/CardModal/DueDate.jsx">
      <h3 className="card-modal-section-title">Срок выполнения</h3>

      {card.due_date && (
        <div className={`current-due-date ${isOverdue ? 'overdue' : ''}`}>
          <span>Текущий дедлайн:</span>
          <strong>{new Date(card.due_date).toLocaleString('ru-RU')}</strong>
          {isOverdue && <span className="overdue-badge">Просрочен</span>}
        </div>
      )}

      <div className="due-date-input-group">
        <input
          type="datetime-local"
          className="due-date-input"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          data-testid="due-date-input"
        />
        <button
          className="btn-save"
          onClick={handleSave}
          data-testid="save-due-date-btn"
        >
          Сохранить
        </button>
        {card.due_date && (
          <button
            className="btn-clear"
            onClick={handleClear}
            data-testid="clear-due-date-btn"
          >
            Очистить
          </button>
        )}
      </div>

      <style>{`
        .current-due-date {
          background: #e3f2fd;
          padding: 12px;
          border-radius: 4px;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .current-due-date.overdue {
          background: #ffebee;
        }

        .overdue-badge {
          background: #d32f2f;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
        }

        .due-date-input-group {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .due-date-input {
          flex: 1;
          min-width: 200px;
          padding: 10px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }

        .btn-clear {
          background: #f5f5f5;
          color: #d32f2f;
          border: none;
          border-radius: 4px;
          padding: 10px 16px;
          cursor: pointer;
          font-size: 14px;
          transition: background 0.2s;
        }

        .btn-clear:hover {
          background: #ffebee;
        }
      `}</style>
    </div>
  );
};
