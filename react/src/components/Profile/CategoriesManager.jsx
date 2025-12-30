import React, { useState, useEffect } from 'react';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../../api/categories';

const CategoriesManager = ({ currentLanguage }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'expense',
    color: '#3B82F6',
    icon: ''
  });

  const translations = {
    ru: {
      title: 'Управление категориями',
      addCategory: 'Добавить категорию',
      categoryName: 'Название категории',
      categoryType: 'Тип категории',
      income: 'Доход',
      expense: 'Расход',
      color: 'Цвет',
      icon: 'Иконка',
      save: 'Сохранить',
      cancel: 'Отмена',
      edit: 'Редактировать',
      delete: 'Удалить',
      defaultCategory: 'Предустановленная категория',
      cannotDelete: 'Нельзя удалить предустановленную категорию',
      noCategories: 'Нет категорий',
      loading: 'Загрузка...',
      confirmDelete: 'Вы уверены, что хотите удалить эту категорию?'
    },
    en: {
      title: 'Categories Management',
      addCategory: 'Add Category',
      categoryName: 'Category Name',
      categoryType: 'Category Type',
      income: 'Income',
      expense: 'Expense',
      color: 'Color',
      icon: 'Icon',
      save: 'Save',
      cancel: 'Cancel',
      edit: 'Edit',
      delete: 'Delete',
      defaultCategory: 'Default category',
      cannotDelete: 'Cannot delete default category',
      noCategories: 'No categories',
      loading: 'Loading...',
      confirmDelete: 'Are you sure you want to delete this category?'
    }
  };

  const t = translations[currentLanguage];

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      return;
    }

    try {
      if (editingId) {
        await updateCategory(editingId, formData);
        setEditingId(null);
      } else {
        await createCategory(formData);
        setShowAddForm(false);
      }
      
      setFormData({
        name: '',
        type: 'expense',
        color: '#3B82F6',
        icon: ''
      });
      
      await loadCategories();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (category) => {
    setEditingId(category.id);
    setFormData({
      name: category.name,
      type: category.type,
      color: category.color || '#3B82F6',
      icon: category.icon || ''
    });
    setShowAddForm(false);
  };

  const handleDelete = async (id, isDefault) => {
    if (isDefault) {
      alert(t.cannotDelete);
      return;
    }

    if (!window.confirm(t.confirmDelete)) {
      return;
    }

    try {
      await deleteCategory(id);
      await loadCategories();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setShowAddForm(false);
    setFormData({
      name: '',
      type: 'expense',
      color: '#3B82F6',
      icon: ''
    });
  };

  if (loading) {
    return (
      <div className="profile-card">
        <div className="loading-message">{t.loading}</div>
      </div>
    );
  }

  return (
    <div className="profile-card">
      <div className="categories-header">
        <h2 className="profile-section-title">{t.title}</h2>
        {!showAddForm && !editingId && (
          <button
            onClick={() => setShowAddForm(true)}
            className="btn-primary btn-small"
            data-testid="categories-add-btn"
          >
            {t.addCategory}
          </button>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      {(showAddForm || editingId) && (
        <form onSubmit={handleSubmit} className="category-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name" className="form-label">{t.categoryName}</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="type" className="form-label">{t.categoryType}</label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="form-select"
                required
              >
                <option value="income">{t.income}</option>
                <option value="expense">{t.expense}</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="color" className="form-label">{t.color}</label>
              <input
                type="color"
                id="color"
                name="color"
                value={formData.color}
                onChange={handleChange}
                className="form-input-color"
              />
            </div>

            <div className="form-group">
              <label htmlFor="icon" className="form-label">{t.icon}</label>
              <input
                type="text"
                id="icon"
                name="icon"
                value={formData.icon}
                onChange={handleChange}
                className="form-input"
                placeholder="💰"
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary">
              {t.save}
            </button>
            <button type="button" onClick={handleCancel} className="btn-secondary">
              {t.cancel}
            </button>
          </div>
        </form>
      )}

      <div className="categories-list">
        {categories.length === 0 ? (
          <div className="empty-message">{t.noCategories}</div>
        ) : (
          categories.map(category => (
            <div
              key={category.id}
              className="category-item"
              data-testid={`category-item-${category.id}`}
            >
              <div className="category-info">
                <div
                  className="category-color-badge"
                  style={{ backgroundColor: category.color || '#3B82F6' }}
                >
                  {category.icon || '📁'}
                </div>
                <div className="category-details">
                  <div className="category-name">{category.name}</div>
                  <div className="category-meta">
                    <span className={`category-type ${category.type}`}>
                      {category.type === 'income' ? t.income : t.expense}
                    </span>
                    {category.is_default && (
                      <span className="category-default">{t.defaultCategory}</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="category-actions">
                <button
                  onClick={() => handleEdit(category)}
                  className="btn-icon"
                  data-testid={`category-edit-btn-${category.id}`}
                  title={t.edit}
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDelete(category.id, category.is_default)}
                  className="btn-icon"
                  data-testid={`category-delete-btn-${category.id}`}
                  disabled={category.is_default}
                  title={category.is_default ? t.cannotDelete : t.delete}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CategoriesManager;
