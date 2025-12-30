import React from 'react';

const TransactionFilters = ({ filters, categories, onChange }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange({
      ...filters,
      [name]: value
    });
  };

  const handleReset = () => {
    onChange({
      type: '',
      category_id: '',
      date_from: '',
      date_to: '',
      counterparty: '',
      project: '',
      account: '',
      search: ''
    });
  };

  const filteredCategories = filters.type
    ? categories.filter(cat => cat.type === filters.type)
    : categories;

  return (
    <div className="transaction-filters" data-easytag="id6-react/src/components/Transactions/TransactionFilters.jsx">
      <div className="filters-row">
        <div className="filter-group">
          <label htmlFor="filter-type">Тип</label>
          <select
            id="filter-type"
            name="type"
            value={filters.type}
            onChange={handleChange}
            data-testid="transactions-filter-type"
          >
            <option value="">Все</option>
            <option value="income">Доход</option>
            <option value="expense">Расход</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="filter-category">Категория</label>
          <select
            id="filter-category"
            name="category_id"
            value={filters.category_id}
            onChange={handleChange}
            data-testid="transactions-filter-category"
          >
            <option value="">Все</option>
            {filteredCategories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="filter-date-from">Дата от</label>
          <input
            id="filter-date-from"
            type="date"
            name="date_from"
            value={filters.date_from}
            onChange={handleChange}
          />
        </div>

        <div className="filter-group">
          <label htmlFor="filter-date-to">Дата до</label>
          <input
            id="filter-date-to"
            type="date"
            name="date_to"
            value={filters.date_to}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="filters-row">
        <div className="filter-group">
          <label htmlFor="filter-counterparty">Контрагент</label>
          <input
            id="filter-counterparty"
            type="text"
            name="counterparty"
            value={filters.counterparty}
            onChange={handleChange}
            placeholder="Поиск по контрагенту"
          />
        </div>

        <div className="filter-group">
          <label htmlFor="filter-project">Проект</label>
          <input
            id="filter-project"
            type="text"
            name="project"
            value={filters.project}
            onChange={handleChange}
            placeholder="Поиск по проекту"
          />
        </div>

        <div className="filter-group">
          <label htmlFor="filter-account">Счет</label>
          <input
            id="filter-account"
            type="text"
            name="account"
            value={filters.account}
            onChange={handleChange}
            placeholder="Поиск по счету"
          />
        </div>

        <div className="filter-group">
          <label htmlFor="filter-search">Поиск</label>
          <input
            id="filter-search"
            type="text"
            name="search"
            value={filters.search}
            onChange={handleChange}
            placeholder="Поиск по описанию"
            data-testid="transactions-filter-search"
          />
        </div>
      </div>

      <div className="filters-actions">
        <button className="btn btn-secondary" onClick={handleReset}>
          Сбросить фильтры
        </button>
      </div>
    </div>
  );
};

export default TransactionFilters;
