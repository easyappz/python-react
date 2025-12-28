import React from 'react';
import { deleteBoard } from '../../api/boards';
import toast from 'react-hot-toast';
import './styles.css';

export const BoardCard = ({ board, onClick, onDelete, isOwner }) => {
  const handleDelete = async (e) => {
    e.stopPropagation();
    
    if (!window.confirm('Вы уверены, что хотите удалить эту доску?')) {
      return;
    }

    try {
      await deleteBoard(board.id);
      onDelete(board.id);
    } catch (error) {
      toast.error('Ошибка при удалении доски');
    }
  };

  return (
    <div
      className="board-card"
      onClick={onClick}
      data-testid={`board-card-${board.id}`}
      data-easytag="id1-react/src/components/BoardCard/index.jsx"
    >
      <div className="board-card-header">
        <div
          className="board-color-indicator"
          style={{ backgroundColor: board.background_color || '#0079bf' }}
        />
        {isOwner && (
          <button
            className="board-delete-btn"
            onClick={handleDelete}
            data-testid={`delete-board-${board.id}`}
            title="Удалить доску"
          >
            ×
          </button>
        )}
      </div>

      <div className="board-card-content">
        <h3 className="board-card-title" data-testid="board-card-title">{board.title}</h3>
        {board.description && (
          <p className="board-card-description">{board.description}</p>
        )}
      </div>

      <div className="board-card-footer">
        {isOwner ? (
          <span className="board-owner-badge">Владелец</span>
        ) : (
          <span className="board-member-badge">Участник</span>
        )}
      </div>
    </div>
  );
};
