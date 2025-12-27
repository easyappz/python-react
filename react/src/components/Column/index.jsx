import React, { useState, useEffect } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { Card } from '../Card';
import { AddCard } from '../AddCard';
import { CardModal } from '../CardModal';
import { getCards } from '../../api/cards';
import { updateColumn, deleteColumn } from '../../api/columns';
import toast from 'react-hot-toast';
import './styles.css';

export const Column = ({ column, onRefresh }) => {
  const [cards, setCards] = useState([]);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(column.title);
  const [selectedCard, setSelectedCard] = useState(null);

  useEffect(() => {
    loadCards();
  }, [column.id]);

  useEffect(() => {
    if (!selectedCard) {
      loadCards();
    }
  }, [selectedCard]);

  const loadCards = async () => {
    try {
      const data = await getCards(column.id);
      setCards(data.sort((a, b) => a.position - b.position));
    } catch (error) {
      console.error('Error loading cards:', error);
    }
  };

  const handleTitleSave = async () => {
    if (!title.trim()) {
      toast.error('Название не может быть пустым');
      setTitle(column.title);
      setIsEditingTitle(false);
      return;
    }

    try {
      await updateColumn(column.id, { title: title.trim() });
      toast.success('Колонка переименована');
      setIsEditingTitle(false);
      onRefresh();
    } catch (error) {
      console.error('Error updating column:', error);
      toast.error('Ошибка переименования колонки');
      setTitle(column.title);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Удалить колонку "${column.title}" и все карточки в ней?`)) {
      return;
    }

    try {
      await deleteColumn(column.id);
      toast.success('Колонка удалена');
      onRefresh();
    } catch (error) {
      console.error('Error deleting column:', error);
      toast.error('Ошибка удаления колонки');
    }
  };

  const handleCardEdit = (card) => {
    setSelectedCard(card);
  };

  return (
    <>
      <div className="column" data-easytag="id1-react/src/components/Column/index.jsx" data-testid={`column-${column.id}`}>
        <div className="column-header">
          {isEditingTitle ? (
            <input
              type="text"
              className="column-title-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleSave}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleTitleSave();
                if (e.key === 'Escape') {
                  setTitle(column.title);
                  setIsEditingTitle(false);
                }
              }}
              autoFocus
              data-testid="column-title-input"
            />
          ) : (
            <h3
              className="column-title"
              onClick={() => setIsEditingTitle(true)}
              data-testid="column-title"
            >
              {title}
            </h3>
          )}
          <button
            className="column-delete-btn"
            onClick={handleDelete}
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
                  onEdit={handleCardEdit}
                />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>

        <AddCard columnId={column.id} onAdd={loadCards} />
      </div>

      {selectedCard && (
        <CardModal
          card={selectedCard}
          boardId={column.board}
          onClose={() => setSelectedCard(null)}
          onUpdate={() => {
            loadCards();
            onRefresh();
          }}
        />
      )}
    </>
  );
};
