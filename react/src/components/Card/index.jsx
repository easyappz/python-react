import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import './styles.css';

export const Card = ({ card, index, onEdit }) => {
  const handleClick = () => {
    onEdit(card);
  };

  return (
    <Draggable draggableId={`card-${card.id}`} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`card ${snapshot.isDragging ? 'dragging' : ''}`}
          onClick={handleClick}
          data-easytag="id1-react/src/components/Card/index.jsx"
          data-testid={`card-${card.id}`}
        >
          <div className="card-content">
            <div className="card-title">{card.title}</div>
            {card.description && (
              <div className="card-description">{card.description}</div>
            )}
            {card.labels && (
              <div className="card-labels">
                {card.labels.split(',').map((label, idx) => (
                  <span key={idx} className="card-label">{label.trim()}</span>
                ))}
              </div>
            )}
            {card.due_date && (
              <div className="card-due-date">
                {new Date(card.due_date).toLocaleDateString('ru-RU')}
              </div>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
};
