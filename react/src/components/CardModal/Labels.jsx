import React, { useState, useEffect } from 'react';
import { getLabels, createLabel, deleteLabel } from '../../api/labels';
import { updateCard } from '../../api/cards';
import toast from 'react-hot-toast';

const LABEL_COLORS = [
  '#61bd4f', '#f2d600', '#ff9f1a', '#eb5a46',
  '#c377e0', '#0079bf', '#00c2e0', '#51e898',
  '#ff78cb', '#344563'
];

export const Labels = ({ card, boardId, onUpdate }) => {
  const [labels, setLabels] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newLabelName, setNewLabelName] = useState('');
  const [selectedColor, setSelectedColor] = useState(LABEL_COLORS[0]);
  const [selectedLabels, setSelectedLabels] = useState([]);

  useEffect(() => {
    loadLabels();
    if (card.labels) {
      setSelectedLabels(card.labels.split(',').map(l => l.trim()));
    }
  }, [card.labels]);

  const loadLabels = async () => {
    try {
      const data = await getLabels(boardId);
      setLabels(data);
    } catch (error) {
      console.error('Error loading labels:', error);
      toast.error('Ошибка загрузки меток');
    }
  };

  const handleCreateLabel = async () => {
    if (!newLabelName.trim()) {
      toast.error('Введите название метки');
      return;
    }

    try {
      await createLabel({
        board: boardId,
        name: newLabelName.trim(),
        color: selectedColor
      });
      toast.success('Метка создана');
      setNewLabelName('');
      setIsCreating(false);
      loadLabels();
    } catch (error) {
      console.error('Error creating label:', error);
      toast.error('Ошибка создания метки');
    }
  };

  const handleToggleLabel = async (labelName) => {
    let newLabels;
    if (selectedLabels.includes(labelName)) {
      newLabels = selectedLabels.filter(l => l !== labelName);
    } else {
      newLabels = [...selectedLabels, labelName];
    }

    try {
      await updateCard(card.id, { labels: newLabels.join(', ') });
      setSelectedLabels(newLabels);
      onUpdate();
    } catch (error) {
      console.error('Error updating labels:', error);
      toast.error('Ошибка обновления меток');
    }
  };

  const handleDeleteLabel = async (labelId) => {
    if (!window.confirm('Удалить эту метку?')) return;

    try {
      await deleteLabel(labelId);
      toast.success('Метка удалена');
      loadLabels();
    } catch (error) {
      console.error('Error deleting label:', error);
      toast.error('Ошибка удаления метки');
    }
  };

  return (
    <div className="card-modal-section" data-easytag="id1-react/src/components/CardModal/Labels.jsx">
      <h3 className="card-modal-section-title">Метки</h3>

      <div className="labels-list">
        {labels.map(label => (
          <div key={label.id} className="label-item">
            <label className="label-checkbox">
              <input
                type="checkbox"
                checked={selectedLabels.includes(label.name)}
                onChange={() => handleToggleLabel(label.name)}
                data-testid={`label-checkbox-${label.id}`}
              />
              <span
                className="label-badge"
                style={{ backgroundColor: label.color }}
              >
                {label.name}
              </span>
            </label>
            <button
              className="label-delete"
              onClick={() => handleDeleteLabel(label.id)}
              data-testid={`delete-label-${label.id}`}
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {isCreating ? (
        <div className="label-create">
          <input
            type="text"
            className="label-input"
            value={newLabelName}
            onChange={(e) => setNewLabelName(e.target.value)}
            placeholder="Название метки"
            autoFocus
            data-testid="label-name-input"
          />
          <div className="color-picker">
            {LABEL_COLORS.map(color => (
              <button
                key={color}
                className={`color-option ${selectedColor === color ? 'selected' : ''}`}
                style={{ backgroundColor: color }}
                onClick={() => setSelectedColor(color)}
                data-testid={`color-${color}`}
              />
            ))}
          </div>
          <div className="label-actions">
            <button
              className="btn-save"
              onClick={handleCreateLabel}
              data-testid="save-label-btn"
            >
              Создать
            </button>
            <button
              className="btn-cancel"
              onClick={() => {
                setIsCreating(false);
                setNewLabelName('');
              }}
              data-testid="cancel-label-btn"
            >
              Отмена
            </button>
          </div>
        </div>
      ) : (
        <button
          className="btn-add-label"
          onClick={() => setIsCreating(true)}
          data-testid="add-label-btn"
        >
          + Создать новую метку
        </button>
      )}

      <style>{`
        .labels-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 16px;
        }

        .label-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }

        .label-checkbox {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          flex: 1;
        }

        .label-badge {
          display: inline-block;
          padding: 6px 12px;
          border-radius: 4px;
          color: white;
          font-size: 14px;
          font-weight: 500;
        }

        .label-delete {
          background: #f5f5f5;
          border: none;
          border-radius: 4px;
          padding: 4px 8px;
          cursor: pointer;
          color: #666;
          transition: all 0.2s;
        }

        .label-delete:hover {
          background: #ffebee;
          color: #d32f2f;
        }

        .label-create {
          background: #f5f5f5;
          padding: 16px;
          border-radius: 4px;
        }

        .label-input {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
          margin-bottom: 12px;
        }

        .color-picker {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 12px;
        }

        .color-option {
          width: 40px;
          height: 32px;
          border: 3px solid transparent;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .color-option:hover {
          transform: scale(1.1);
        }

        .color-option.selected {
          border-color: #333;
        }

        .label-actions {
          display: flex;
          gap: 8px;
        }

        .btn-add-label {
          background: #f5f5f5;
          color: #333;
          border: none;
          border-radius: 4px;
          padding: 10px 16px;
          cursor: pointer;
          font-size: 14px;
          width: 100%;
          transition: background 0.2s;
        }

        .btn-add-label:hover {
          background: #e0e0e0;
        }
      `}</style>
    </div>
  );
};
