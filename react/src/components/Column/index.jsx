import React, { useState, useEffect } from 'react';
import { Droppable } from 'react-beautiful-dnd';
import { Card } from '../Card';
import { AddCard } from '../AddCard';
import { getCards, createCard, deleteCard } from '../../api/cards';
import { updateColumn, deleteColumn } from '../../api/columns';
import toast from 'react-hot-toast';
import './styles.css';

export const Column = ({ column, onRefresh }) => {
  const [cards, setCards] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(column.title);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadCards();
  }, [column.id]);

  const loadCards = async () => {
    try {
      const data = await getCards(column.id);
      setCards(data.sort((a, b) => a.position - b.position));
    } catch (error) {
      console.error('Error loading cards:', error);
      toast.error('Ошибка загрузки карточек');
    }
  };

  const handleAddCard = async (cardData) => {
    try {
      await createCard(cardData);
      await loadCards();
      toast.success('Карточка создана');
    } catch (error) {
      console.error('Error creating card:', error);
      toast.error('Ошибка создания карточки');
    }
  };

  const handleDeleteCard = async (cardId) => {
    if (!window.confirm('Удалить карточку?')) return;

    try {
      await deleteCard(cardId);
      await loadCards();
      toast.success('Карточка удалена');
    } catch (error) {
      console.error('Error deleting card:', error);
      toast.error('Ошибка удаления карточки');
    }
  };

  const handleEditCard = (card) => {
    toast('Редактирование карточки будет доступно позже');
  };

  const handleUpdateTitle = async () => {
    if (!title.trim()) {
      setTitle(column.title);
      setIsEditing(false);
      return;
    }

    if (title === column.title) {
      setIsEditing(false);
      return;
    }

    setIsLoading(true);
    try {
      await updateColumn(column.id, { title: title.trim() });
      setIsEditing(false);
      toast.success('Колонка обновлена');
      onRefresh();
    } catch (error) {
      console.error('Error updating column:', error);
      toast.error('Ошибка обновления колонки');
      setTitle(column.title);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteColumn = async () => {
    if (!window.confirm('Удалить колонку и все карточки в ней?')) return;

    try {
      await deleteColumn(column.id);
      toast.success('Колонка удалена');
      onRefresh();
    } catch (error) {
      console.error('Error deleting column:', error);
      toast.error('Ошибка удаления колонки');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleUpdateTitle();
    } else if (e.key === 'Escape') {
      setTitle(column.title);
      setIsEditing(false);
    }
  };

  return (
    <div className="column" data-easytag="id1-react/src/components/Column/index.jsx" data-testid={`column-${column.id}`}>
      <div className="column-header">
        {isEditing ? (
          <input
            type="text"
            className="column-title-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleUpdateTitle}
            onKeyDown={handleKeyPress}
            disabled={isLoading}
            autoFocus
            data-testid="column-title-input"
          />
        ) : (
          <h3
            className="column-title"
            onClick={() => setIsEditing(true)}
            data-testid="column-title"
          >
            {column.title}
          </h3>
        )}
        <button
          className="column-delete-btn"
          onClick={handleDeleteColumn}
          title="Удалить колонку"
          data-testid="delete-column-btn"
        >
          🗑️
        </button>
      </div>

      <Droppable droppableId={`column-${column.id}`}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`column-cards ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
          >
            {cards.map((card, index) => (
              <Card
                key={card.id}
                card={card}
                index={index}
                onEdit={handleEditCard}
                onDelete={handleDeleteCard}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      <AddCard columnId={column.id} onAdd={handleAddCard} />
    </div>
  );
};
