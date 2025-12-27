import React, { useState } from 'react';
import { createBoard } from '../../api/boards';
import toast from 'react-hot-toast';
import './styles.css';

const COLOR_PRESETS = [
  '#0079bf',
  '#d29034',
  '#519839',
  '#b04632',
  '#89609e',
  '#cd5a91',
  '#4bbf6b',
  '#00aecc',
  '#838c91',
];

export const CreateBoardModal = ({ onClose, onBoardCreated }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    background_color: '#0079bf',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleColorSelect = (color) => {
    setFormData(prev => ({
      ...prev,
      background_color: color,
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Название доски обязательно';
    } else if (formData.title.length > 255) {
      newErrors.title = 'Название не должно превышать 255 символов';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      const payload = {
        title: formData.title.trim(),
        background_color: formData.background_color,
      };

      if (formData.description.trim()) {
        payload.description = formData.description.trim();
      }

      const newBoard = await createBoard(payload);
      onBoardCreated(newBoard);
    } catch (error) {
      if (error.response?.data) {
        setErrors(error.response.data);
      } else {
        toast.error('Ошибка при создании доски');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={handleOverlayClick}
      data-testid="create-board-modal"
      data-easytag="id1-react/src/components/CreateBoardModal/index.jsx"
    >
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">Создать доску</h2>
          <button
            className="modal-close-btn"
            onClick={onClose}
            type="button"
            data-testid="close-modal-button"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label" htmlFor="title">
                Название доски *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                className="form-input"
                value={formData.title}
                onChange={handleChange}
                placeholder="Введите название доски"
                data-testid="board-title-input"
                maxLength={255}
              />
              {errors.title && (
                <div className="form-error">{errors.title}</div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="description">
                Описание
              </label>
              <textarea
                id="description"
                name="description"
                className="form-textarea"
                value={formData.description}
                onChange={handleChange}
                placeholder="Добавьте описание доски (необязательно)"
                data-testid="board-description-input"
              />
              {errors.description && (
                <div className="form-error">{errors.description}</div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Цвет фона</label>
              <div className="color-picker-group">
                <input
                  type="color"
                  name="background_color"
                  className="color-input"
                  value={formData.background_color}
                  onChange={handleChange}
                  data-testid="board-color-input"
                />
                <div className="color-preview">
                  {COLOR_PRESETS.map((color) => (
                    <div
                      key={color}
                      className={`color-preset ${
                        formData.background_color === color ? 'selected' : ''
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => handleColorSelect(color)}
                      data-testid={`color-preset-${color}`}
                    />
                  ))}
                </div>
              </div>
              {errors.background_color && (
                <div className="form-error">{errors.background_color}</div>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Отмена
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              data-testid="submit-board-button"
            >
              {loading ? 'Создание...' : 'Создать доску'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
