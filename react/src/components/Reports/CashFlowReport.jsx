import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const CashFlowReport = ({ data }) => {
  if (!data || !data.monthly_data) {
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

  const chartData = (data.monthly_data || []).map(item => ({
    month: formatMonth(item.month),
    'Поступления': parseFloat(item.inflows),
    'Платежи': parseFloat(item.outflows),
    'Чистый поток': parseFloat(item.net_flow)
  }));

  return (
    <div className="cash-flow-report">
      <div className="report-summary">
        <div className="summary-card inflows">
          <h3>Поступления</h3>
          <p className="amount">{formatCurrency(data.cash_inflows)}</p>
        </div>
        <div className="summary-card outflows">
          <h3>Платежи</h3>
          <p className="amount">{formatCurrency(data.cash_outflows)}</p>
        </div>
        <div className="summary-card net-flow">
          <h3>Чистый денежный поток</h3>
          <p className="amount">{formatCurrency(data.net_cash_flow)}</p>
        </div>
      </div>

      <div className="report-chart" data-testid="report-chart">
        <h3>Динамика денежного потока</h3>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
              <Bar dataKey="Поступления" fill="#00C49F" />
              <Bar dataKey="Платежи" fill="#FF8042" />
              <Bar dataKey="Чистый поток" fill="#0088FE" />
            </BarChart>
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
              <th className="text-right">Поступления</th>
              <th className="text-right">Платежи</th>
              <th className="text-right">Чистый поток</th>
            </tr>
          </thead>
          <tbody>
            {(data.monthly_data || []).map((item, index) => (
              <tr key={index}>
                <td>{formatMonth(item.month)}</td>
                <td className="text-right">{formatCurrency(item.inflows)}</td>
                <td className="text-right">{formatCurrency(item.outflows)}</td>
                <td className="text-right">{formatCurrency(item.net_flow)}</td>
              </tr>
            ))}
            <tr className="total-row">
              <td><strong>Итого</strong></td>
              <td className="text-right"><strong>{formatCurrency(data.cash_inflows)}</strong></td>
              <td className="text-right"><strong>{formatCurrency(data.cash_outflows)}</strong></td>
              <td className="text-right"><strong>{formatCurrency(data.net_cash_flow)}</strong></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CashFlowReport;
