import React, { useState } from 'react';
import './styles.css';

export const AddCard = ({ columnId, onAdd }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsLoading(true);
    try {
      await onAdd({
        column: columnId,
        title: title.trim(),
        description: description.trim() || null,
        position: 0
      });
      setTitle('');
      setDescription('');
      setIsAdding(false);
    } catch (error) {
      console.error('Error creating card:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setTitle('');
    setDescription('');
    setIsAdding(false);
  };

  if (!isAdding) {
    return (
      <button
        className="add-card-btn"
        onClick={() => setIsAdding(true)}
        data-testid="add-card-trigger"
        data-easytag="id1-react/src/components/AddCard/index.jsx"
      >
        + Добавить карточку
      </button>
    );
  }

  return (
    <form
      className="add-card-form"
      onSubmit={handleSubmit}
      data-easytag="id2-react/src/components/AddCard/index.jsx"
    >
      <input
        type="text"
        className="add-card-input"
        placeholder="Название карточки"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        autoFocus
        disabled={isLoading}
        data-testid="card-title-input"
      />
      <textarea
        className="add-card-textarea"
        placeholder="Описание (необязательно)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        disabled={isLoading}
        rows={3}
        data-testid="card-description-input"
      />
      <div className="add-card-actions">
        <button
          type="submit"
          className="add-card-submit"
          disabled={isLoading || !title.trim()}
          data-testid="card-submit-btn"
        >
          {isLoading ? 'Добавление...' : 'Добавить'}
        </button>
        <button
          type="button"
          className="add-card-cancel"
          onClick={handleCancel}
          disabled={isLoading}
          data-testid="card-cancel-btn"
        >
          Отмена
        </button>
      </div>
    </form>
  );
};
