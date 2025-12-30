import React from 'react';

const PeriodFilter = ({ period, dateFrom, dateTo, onChange }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange({ ...{ period, dateFrom, dateTo }, [name]: value });
  };

  return (
    <div className="period-filter">
      <div className="filter-group">
        <label htmlFor="period-select">Период</label>
        <select
          id="period-select"
          name="period"
          value={period}
          onChange={handleChange}
          data-testid="reports-period-select"
        >
          <option value="current_month">Текущий месяц</option>
          <option value="last_month">Прошлый месяц</option>
          <option value="current_year">Текущий год</option>
          <option value="custom">Произвольный период</option>
        </select>
      </div>

      {period === 'custom' && (
        <>
          <div className="filter-group">
            <label htmlFor="date-from">Дата от</label>
            <input
              id="date-from"
              type="date"
              name="dateFrom"
              value={dateFrom}
              onChange={handleChange}
            />
          </div>

          <div className="filter-group">
            <label htmlFor="date-to">Дата до</label>
            <input
              id="date-to"
              type="date"
              name="dateTo"
              value={dateTo}
              onChange={handleChange}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default PeriodFilter;
