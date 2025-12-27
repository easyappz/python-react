import React, { useState } from 'react';
import './styles.css';

export const AddColumn = ({ onAdd }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsLoading(true);
    try {
      await onAdd(title.trim());
      setTitle('');
      setIsAdding(false);
    } catch (error) {
      console.error('Error creating column:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setTitle('');
    setIsAdding(false);
  };

  if (!isAdding) {
    return (
      <div className="add-column-container" data-easytag="id1-react/src/components/AddColumn/index.jsx">
        <button
          className="add-column-btn"
          onClick={() => setIsAdding(true)}
          data-testid="add-column-trigger"
        >
          + Добавить колонку
        </button>
      </div>
    );
  }

  return (
    <div className="add-column-container" data-easytag="id2-react/src/components/AddColumn/index.jsx">
      <form className="add-column-form" onSubmit={handleSubmit}>
        <input
          type="text"
          className="add-column-input"
          placeholder="Название колонки"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
          disabled={isLoading}
          data-testid="column-title-input"
        />
        <div className="add-column-actions">
          <button
            type="submit"
            className="add-column-submit"
            disabled={isLoading || !title.trim()}
            data-testid="column-submit-btn"
          >
            {isLoading ? 'Добавление...' : 'Добавить'}
          </button>
          <button
            type="button"
            className="add-column-cancel"
            onClick={handleCancel}
            disabled={isLoading}
            data-testid="column-cancel-btn"
          >
            ✕
          </button>
        </div>
      </form>
    </div>
  );
};
