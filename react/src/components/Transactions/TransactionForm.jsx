import React, { useState, useEffect } from 'react';
import { createTransaction, updateTransaction } from '../../api/transactions';

const TransactionForm = ({ transaction, categories, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category_id: '',
    description: '',
    counterparty: '',
    project: '',
    account: '',
    document: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (transaction) {
      setFormData({
        type: transaction.type || 'expense',
        amount: transaction.amount || '',
        date: transaction.date || new Date().toISOString().split('T')[0],
        category_id: transaction.category_id || '',
        description: transaction.description || '',
        counterparty: transaction.counterparty || '',
        project: transaction.project || '',
        account: transaction.account || '',
        document: transaction.document || ''
      });
    }
  }, [transaction]);

  const filteredCategories = categories.filter(cat => cat.type === formData.type);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.type) {
      newErrors.type = 'Выберите тип транзакции';
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Введите корректную сумму';
    }

    if (!formData.date) {
      newErrors.date = 'Выберите дату';
    }

    if (!formData.category_id) {
      newErrors.category_id = 'Выберите категорию';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    if (name === 'type') {
      setFormData(prev => ({
        ...prev,
        type: value,
        category_id: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const submitData = {
        type: formData.type,
        amount: parseFloat(formData.amount),
        date: formData.date,
        category_id: parseInt(formData.category_id),
        description: formData.description || undefined,
        counterparty: formData.counterparty || undefined,
        project: formData.project || undefined,
        account: formData.account || undefined,
        document: formData.document || undefined
      };

      if (transaction) {
        await updateTransaction(transaction.id, submitData);
      } else {
        await createTransaction(submitData);
      }

      onSuccess();
    } catch (err) {
      alert(err.message || 'Не удалось сохранить транзакцию');
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} data-easytag="id5-react/src/components/Transactions/TransactionForm.jsx">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{transaction ? 'Редактировать транзакцию' : 'Добавить транзакцию'}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="transaction-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="type">Тип транзакции *</label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className={errors.type ? 'error' : ''}
                data-testid="transaction-form-type"
              >
                <option value="income">Доход</option>
                <option value="expense">Расход</option>
              </select>
              {errors.type && <span className="error-message">{errors.type}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="amount">Сумма *</label>
              <input
                id="amount"
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                className={errors.amount ? 'error' : ''}
                data-testid="transaction-form-amount"
              />
              {errors.amount && <span className="error-message">{errors.amount}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="date">Дата *</label>
              <input
                id="date"
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className={errors.date ? 'error' : ''}
                data-testid="transaction-form-date"
              />
              {errors.date && <span className="error-message">{errors.date}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="category_id">Категория *</label>
              <select
                id="category_id"
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                className={errors.category_id ? 'error' : ''}
                data-testid="transaction-form-category"
              >
                <option value="">Выберите категорию</option>
                {filteredCategories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.category_id && <span className="error-message">{errors.category_id}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Описание</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Описание транзакции"
              rows="3"
              data-testid="transaction-form-description"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="counterparty">Контрагент</label>
              <input
                id="counterparty"
                type="text"
                name="counterparty"
                value={formData.counterparty}
                onChange={handleChange}
                placeholder="Название контрагента"
                data-testid="transaction-form-counterparty"
              />
            </div>

            <div className="form-group">
              <label htmlFor="project">Проект</label>
              <input
                id="project"
                type="text"
                name="project"
                value={formData.project}
                onChange={handleChange}
                placeholder="Название проекта"
                data-testid="transaction-form-project"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="account">Счет</label>
              <input
                id="account"
                type="text"
                name="account"
                value={formData.account}
                onChange={handleChange}
                placeholder="Название счета"
                data-testid="transaction-form-account"
              />
            </div>

            <div className="form-group">
              <label htmlFor="document">Документ</label>
              <input
                id="document"
                type="text"
                name="document"
                value={formData.document}
                onChange={handleChange}
                placeholder="Номер документа"
                data-testid="transaction-form-document"
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Отмена
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading} data-testid="transaction-form-submit">
              {loading ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionForm;
