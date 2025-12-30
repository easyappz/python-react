import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const TaxReport = ({ data }) => {
  if (!data) {
    return <div className="report-empty">Загрузка данных...</div>;
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB'
    }).format(amount);
  };

  const formatMonth = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { month: 'short', year: 'numeric' });
  };

  const chartData = data.monthly_breakdown.map(item => ({
    month: formatMonth(item.month),
    'Доход': parseFloat(item.income),
    'Расход': parseFloat(item.expenses),
    'Налогооблагаемая база': parseFloat(item.taxable_income),
    'Налог': parseFloat(item.tax)
  }));

  return (
    <div className="tax-report">
      <div className="report-summary">
        <div className="summary-card income">
          <h3>Доход</h3>
          <p className="amount">{formatCurrency(data.total_income)}</p>
        </div>
        <div className="summary-card expenses">
          <h3>Расход</h3>
          <p className="amount">{formatCurrency(data.total_expenses)}</p>
        </div>
        <div className="summary-card taxable">
          <h3>Налогооблагаемая база</h3>
          <p className="amount">{formatCurrency(data.taxable_income)}</p>
        </div>
        <div className="summary-card rate">
          <h3>Ставка налога</h3>
          <p className="amount">{data.tax_rate}%</p>
        </div>
        <div className="summary-card tax">
          <h3>Налог к уплате</h3>
          <p className="amount">{formatCurrency(data.estimated_tax)}</p>
        </div>
      </div>

      <div className="report-chart" data-testid="report-chart">
        <h3>Динамика налогов</h3>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
              <Line type="monotone" dataKey="Доход" stroke="#00C49F" strokeWidth={2} />
              <Line type="monotone" dataKey="Расход" stroke="#FF8042" strokeWidth={2} />
              <Line type="monotone" dataKey="Налогооблагаемая база" stroke="#0088FE" strokeWidth={2} />
              <Line type="monotone" dataKey="Налог" stroke="#8884D8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="chart-empty">Нет данных</div>
        )}
      </div>

      <div className="report-table-container">
        <h3>Помесячная детализация</h3>
        <table className="report-table" data-testid="report-table">
          <thead>
            <tr>
              <th>Месяц</th>
              <th className="text-right">Доход</th>
              <th className="text-right">Расход</th>
              <th className="text-right">Налогооблагаемая база</th>
              <th className="text-right">Налог</th>
            </tr>
          </thead>
          <tbody>
            {data.monthly_breakdown.map((item, index) => (
              <tr key={index}>
                <td>{formatMonth(item.month)}</td>
                <td className="text-right">{formatCurrency(item.income)}</td>
                <td className="text-right">{formatCurrency(item.expenses)}</td>
                <td className="text-right">{formatCurrency(item.taxable_income)}</td>
                <td className="text-right">{formatCurrency(item.tax)}</td>
              </tr>
            ))}
            <tr className="total-row">
              <td><strong>Итого</strong></td>
              <td className="text-right"><strong>{formatCurrency(data.total_income)}</strong></td>
              <td className="text-right"><strong>{formatCurrency(data.total_expenses)}</strong></td>
              <td className="text-right"><strong>{formatCurrency(data.taxable_income)}</strong></td>
              <td className="text-right"><strong>{formatCurrency(data.estimated_tax)}</strong></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TaxReport;
