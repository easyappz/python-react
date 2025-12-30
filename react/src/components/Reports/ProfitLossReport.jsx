import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF6B9D'];

const ProfitLossReport = ({ data }) => {
  if (!data) {
    return <div className="report-empty">Загрузка данных...</div>;
  }

  const incomeChartData = data.income.categories.map(cat => ({
    name: cat.category_name,
    value: parseFloat(cat.amount)
  }));

  const expensesChartData = data.expenses.categories.map(cat => ({
    name: cat.category_name,
    value: parseFloat(cat.amount)
  }));

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB'
    }).format(amount);
  };

  return (
    <div className="profit-loss-report">
      <div className="report-summary">
        <div className="summary-card income">
          <h3>Доходы</h3>
          <p className="amount">{formatCurrency(data.income.total)}</p>
        </div>
        <div className="summary-card expenses">
          <h3>Расходы</h3>
          <p className="amount">{formatCurrency(data.expenses.total)}</p>
        </div>
        <div className="summary-card gross-profit">
          <h3>Валовая прибыль</h3>
          <p className="amount">{formatCurrency(data.gross_profit)}</p>
        </div>
        <div className="summary-card taxes">
          <h3>Налоги</h3>
          <p className="amount">{formatCurrency(data.taxes)}</p>
        </div>
        <div className="summary-card net-profit">
          <h3>Чистая прибыль</h3>
          <p className="amount">{formatCurrency(data.net_profit)}</p>
        </div>
      </div>

      <div className="report-charts">
        <div className="chart-container">
          <h3>Структура доходов</h3>
          {incomeChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={incomeChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {incomeChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-empty">Нет данных</div>
          )}
        </div>

        <div className="chart-container">
          <h3>Структура расходов</h3>
          {expensesChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={expensesChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {expensesChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-empty">Нет данных</div>
          )}
        </div>
      </div>

      <div className="report-tables">
        <div className="table-container">
          <h3>Доходы по категориям</h3>
          <table className="report-table" data-testid="report-table">
            <thead>
              <tr>
                <th>Категория</th>
                <th className="text-right">Сумма</th>
              </tr>
            </thead>
            <tbody>
              {data.income.categories.map((cat) => (
                <tr key={cat.category_id}>
                  <td>{cat.category_name}</td>
                  <td className="text-right">{formatCurrency(cat.amount)}</td>
                </tr>
              ))}
              <tr className="total-row">
                <td><strong>Итого</strong></td>
                <td className="text-right"><strong>{formatCurrency(data.income.total)}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="table-container">
          <h3>Расходы по категориям</h3>
          <table className="report-table">
            <thead>
              <tr>
                <th>Категория</th>
                <th className="text-right">Сумма</th>
              </tr>
            </thead>
            <tbody>
              {data.expenses.categories.map((cat) => (
                <tr key={cat.category_id}>
                  <td>{cat.category_name}</td>
                  <td className="text-right">{formatCurrency(cat.amount)}</td>
                </tr>
              ))}
              <tr className="total-row">
                <td><strong>Итого</strong></td>
                <td className="text-right"><strong>{formatCurrency(data.expenses.total)}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProfitLossReport;
