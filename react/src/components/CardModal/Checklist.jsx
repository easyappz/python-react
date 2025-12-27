import React, { useState, useEffect } from 'react';
import {
  getChecklists,
  createChecklist,
  deleteChecklist,
  getChecklistItems,
  createChecklistItem,
  updateChecklistItem,
  deleteChecklistItem
} from '../../api/checklists';
import toast from 'react-hot-toast';

export const Checklist = ({ cardId }) => {
  const [checklists, setChecklists] = useState([]);
  const [checklistItems, setChecklistItems] = useState({});
  const [isCreating, setIsCreating] = useState(false);
  const [newChecklistTitle, setNewChecklistTitle] = useState('');
  const [newItemTexts, setNewItemTexts] = useState({});

  useEffect(() => {
    loadChecklists();
  }, [cardId]);

  const loadChecklists = async () => {
    try {
      const data = await getChecklists(cardId);
      setChecklists(data);
      
      const itemsData = {};
      for (const checklist of data) {
        const items = await getChecklistItems(checklist.id);
        itemsData[checklist.id] = items;
      }
      setChecklistItems(itemsData);
    } catch (error) {
      console.error('Error loading checklists:', error);
      toast.error('Ошибка загрузки чек-листов');
    }
  };

  const handleCreateChecklist = async () => {
    if (!newChecklistTitle.trim()) {
      toast.error('Введите название чек-листа');
      return;
    }

    try {
      await createChecklist({
        card: cardId,
        title: newChecklistTitle.trim()
      });
      toast.success('Чек-лист создан');
      setNewChecklistTitle('');
      setIsCreating(false);
      loadChecklists();
    } catch (error) {
      console.error('Error creating checklist:', error);
      toast.error('Ошибка создания чек-листа');
    }
  };

  const handleDeleteChecklist = async (checklistId) => {
    if (!window.confirm('Удалить этот чек-лист?')) return;

    try {
      await deleteChecklist(checklistId);
      toast.success('Чек-лист удален');
      loadChecklists();
    } catch (error) {
      console.error('Error deleting checklist:', error);
      toast.error('Ошибка удаления чек-листа');
    }
  };

  const handleAddItem = async (checklistId) => {
    const text = newItemTexts[checklistId];
    if (!text || !text.trim()) {
      toast.error('Введите текст элемента');
      return;
    }

    try {
      await createChecklistItem({
        checklist: checklistId,
        text: text.trim(),
        is_completed: false
      });
      setNewItemTexts({ ...newItemTexts, [checklistId]: '' });
      loadChecklists();
    } catch (error) {
      console.error('Error creating item:', error);
      toast.error('Ошибка создания элемента');
    }
  };

  const handleToggleItem = async (itemId, currentStatus) => {
    try {
      await updateChecklistItem(itemId, {
        is_completed: !currentStatus
      });
      loadChecklists();
    } catch (error) {
      console.error('Error toggling item:', error);
      toast.error('Ошибка обновления элемента');
    }
  };

  const handleDeleteItem = async (itemId) => {
    try {
      await deleteChecklistItem(itemId);
      loadChecklists();
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Ошибка удаления элемента');
    }
  };

  const calculateProgress = (checklistId) => {
    const items = checklistItems[checklistId] || [];
    if (items.length === 0) return 0;
    const completed = items.filter(item => item.is_completed).length;
    return Math.round((completed / items.length) * 100);
  };

  return (
    <div className="card-modal-section" data-easytag="id1-react/src/components/CardModal/Checklist.jsx">
      <h3 className="card-modal-section-title">Чек-листы</h3>

      <div className="checklists-container">
        {checklists.map(checklist => {
          const progress = calculateProgress(checklist.id);
          const items = checklistItems[checklist.id] || [];

          return (
            <div key={checklist.id} className="checklist">
              <div className="checklist-header">
                <h4 className="checklist-title">{checklist.title}</h4>
                <button
                  className="checklist-delete"
                  onClick={() => handleDeleteChecklist(checklist.id)}
                  data-testid={`delete-checklist-${checklist.id}`}
                >
                  🗑️
                </button>
              </div>

              {items.length > 0 && (
                <div className="checklist-progress">
                  <span className="progress-text">{progress}%</span>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="checklist-items">
                {items.map(item => (
                  <div key={item.id} className="checklist-item">
                    <label className="item-checkbox">
                      <input
                        type="checkbox"
                        checked={item.is_completed}
                        onChange={() => handleToggleItem(item.id, item.is_completed)}
                        data-testid={`item-checkbox-${item.id}`}
                      />
                      <span className={item.is_completed ? 'completed' : ''}>
                        {item.text}
                      </span>
                    </label>
                    <button
                      className="item-delete"
                      onClick={() => handleDeleteItem(item.id)}
                      data-testid={`delete-item-${item.id}`}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              <div className="add-item">
                <input
                  type="text"
                  className="item-input"
                  value={newItemTexts[checklist.id] || ''}
                  onChange={(e) => setNewItemTexts({
                    ...newItemTexts,
                    [checklist.id]: e.target.value
                  })}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddItem(checklist.id);
                  }}
                  placeholder="Добавить элемент"
                  data-testid={`add-item-input-${checklist.id}`}
                />
                <button
                  className="btn-add-item"
                  onClick={() => handleAddItem(checklist.id)}
                  data-testid={`add-item-btn-${checklist.id}`}
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {isCreating ? (
        <div className="create-checklist">
          <input
            type="text"
            className="checklist-input"
            value={newChecklistTitle}
            onChange={(e) => setNewChecklistTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreateChecklist();
              if (e.key === 'Escape') {
                setIsCreating(false);
                setNewChecklistTitle('');
              }
            }}
            placeholder="Название чек-листа"
            autoFocus
            data-testid="checklist-title-input"
          />
          <div className="checklist-actions">
            <button
              className="btn-save"
              onClick={handleCreateChecklist}
              data-testid="save-checklist-btn"
            >
              Создать
            </button>
            <button
              className="btn-cancel"
              onClick={() => {
                setIsCreating(false);
                setNewChecklistTitle('');
              }}
              data-testid="cancel-checklist-btn"
            >
              Отмена
            </button>
          </div>
        </div>
      ) : (
        <button
          className="btn-add-checklist"
          onClick={() => setIsCreating(true)}
          data-testid="add-checklist-btn"
        >
          + Добавить чек-лист
        </button>
      )}

      <style>{`
        .checklists-container {
          display: flex;
          flex-direction: column;
          gap: 20px;
          margin-bottom: 16px;
        }

        .checklist {
          background: #f5f5f5;
          padding: 16px;
          border-radius: 4px;
        }

        .checklist-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .checklist-title {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: #333;
        }

        .checklist-delete {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 16px;
          padding: 4px 8px;
          border-radius: 4px;
          transition: background 0.2s;
        }

        .checklist-delete:hover {
          background: #ffebee;
        }

        .checklist-progress {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }

        .progress-text {
          font-size: 14px;
          font-weight: 600;
          color: #666;
          min-width: 40px;
        }

        .progress-bar {
          flex: 1;
          height: 8px;
          background: #ddd;
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: #61bd4f;
          transition: width 0.3s;
        }

        .checklist-items {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 12px;
        }

        .checklist-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          background: white;
          padding: 8px 12px;
          border-radius: 4px;
        }

        .item-checkbox {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          flex: 1;
        }

        .item-checkbox span {
          color: #333;
        }

        .item-checkbox span.completed {
          text-decoration: line-through;
          color: #999;
        }

        .item-delete {
          background: none;
          border: none;
          cursor: pointer;
          color: #999;
          padding: 4px 8px;
          border-radius: 4px;
          transition: all 0.2s;
        }

        .item-delete:hover {
          background: #ffebee;
          color: #d32f2f;
        }

        .add-item {
          display: flex;
          gap: 8px;
        }

        .item-input {
          flex: 1;
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }

        .btn-add-item {
          background: #0079bf;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 8px 16px;
          cursor: pointer;
          font-size: 16px;
          transition: background 0.2s;
        }

        .btn-add-item:hover {
          background: #026aa7;
        }

        .create-checklist {
          background: #f5f5f5;
          padding: 16px;
          border-radius: 4px;
        }

        .checklist-input {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
          margin-bottom: 12px;
        }

        .checklist-actions {
          display: flex;
          gap: 8px;
        }

        .btn-add-checklist {
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

        .btn-add-checklist:hover {
          background: #e0e0e0;
        }
      `}</style>
    </div>
  );
};
