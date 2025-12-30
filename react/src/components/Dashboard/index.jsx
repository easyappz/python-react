import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStats, getDynamics, getTopCategories } from '../../api/dashboard';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './styles.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [period, setPeriod] = useState('current_month');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [stats, setStats] = useState(null);
  const [dynamics, setDynamics] = useState([]);
  const [topCategories, setTopCategories] = useState({ income_categories: [], expense_categories: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  useEffect(() => {
    loadDashboardData();
  }, [period, dateFrom, dateTo]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const statsData = await getStats(period, dateFrom, dateTo);
      setStats(statsData);

      const dynamicsData = await getDynamics(period === 'current_month' || period === 'last_month' ? 'current_year' : period, dateFrom, dateTo);
      setDynamics(dynamicsData.dynamics || []);

      const topCategoriesData = await getTopCategories(period, dateFrom, dateTo, 5);
      setTopCategories(topCategoriesData);

      setLoading(false);
    } catch (err) {
      setError('Ошибка загрузки данных');
      setLoading(false);
      console.error('Dashboard data loading error:', err);
    }
  };

  const handlePeriodChange = (e) => {
    const newPeriod = e.target.value;
    setPeriod(newPeriod);
    if (newPeriod !== 'custom') {
      setDateFrom('');
      setDateTo('');
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value || 0);
  };

  const formatMonth = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { year: 'numeric', month: 'short' });
  };

  if (loading) {
    return (
      <div className="dashboard-container" data-easytag="id2-react/src/components/Dashboard/index.jsx">
        <div className="dashboard-loading">Загрузка...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container" data-easytag="id2-react/src/components/Dashboard/index.jsx">
        <div className="dashboard-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container" data-easytag="id2-react/src/components/Dashboard/index.jsx">
      <div className="dashboard-header">
        <h1>Панель управления</h1>
        <div className="dashboard-nav">
          <button className="btn btn-primary" onClick={() => navigate('/transactions')}>
            Транзакции
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/reports')}>
            Отчеты
          </button>
        </div>
      </div>

      <div className="period-filter-section">
        <label htmlFor="period-select">Период:</label>
        <select 
          id="period-select"
          data-testid="dashboard-period-select"
          value={period} 
          onChange={handlePeriodChange}
          className="period-select"
        >
          <option value="current_month">Текущий месяц</option>
          <option value="last_month">Прошлый месяц</option>
          <option value="current_year">Текущий год</option>
          <option value="custom">Произвольный период</option>
        </select>
        {period === 'custom' && (
          <div className="custom-period">
            <input 
              type="date" 
              value={dateFrom} 
              onChange={(e) => setDateFrom(e.target.value)}
              className="date-input"
              placeholder="От"
            />
            <input 
              type="date" 
              value={dateTo} 
              onChange={(e) => setDateTo(e.target.value)}
              className="date-input"
              placeholder="До"
            />
          </div>
        )}
      </div>

      <div className="metrics-grid">
        <div className="metric-card" data-testid="dashboard-income-card">
          <div className="metric-icon income-icon">↑</div>
          <div className="metric-content">
            <h3>Общий доход</h3>
            <p className="metric-value">{formatCurrency(stats?.total_income)}</p>
          </div>
        </div>

        <div className="metric-card" data-testid="dashboard-expenses-card">
          <div className="metric-icon expenses-icon">↓</div>
          <div className="metric-content">
            <h3>Общие расходы</h3>
            <p className="metric-value">{formatCurrency(stats?.total_expenses)}</p>
          </div>
        </div>

        <div className="metric-card" data-testid="dashboard-profit-card">
          <div className="metric-icon profit-icon">★</div>
          <div className="metric-content">
            <h3>Чистая прибыль</h3>
            <p className="metric-value">{formatCurrency(stats?.net_profit)}</p>
          </div>
        </div>

        <div className="metric-card" data-testid="dashboard-taxes-card">
          <div className="metric-icon taxes-icon">⚖</div>
          <div className="metric-content">
            <h3>Налоги</h3>
            <p className="metric-value">{formatCurrency(stats?.taxes)}</p>
          </div>
        </div>

        <div className="metric-card" data-testid="dashboard-cashflow-card">
          <div className="metric-icon cashflow-icon">💰</div>
          <div className="metric-content">
            <h3>Денежный поток</h3>
            <p className="metric-value">{formatCurrency(stats?.cash_flow)}</p>
          </div>
        </div>

        <div className="metric-card" data-testid="dashboard-profitability-card">
          <div className="metric-icon profitability-icon">%</div>
          <div className="metric-content">
            <h3>Рентабельность</h3>
            <p className="metric-value">{stats?.profitability ? `${parseFloat(stats.profitability).toFixed(1)}%` : '0%'}</p>
          </div>
        </div>
      </div>

      {dynamics.length > 0 && (
        <div className="chart-section" data-testid="dashboard-dynamics-chart">
          <h2>Динамика по месяцам</h2>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={dynamics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month" 
                tickFormatter={formatMonth}
              />
              <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
              <Tooltip 
                formatter={(value) => formatCurrency(value)}
                labelFormatter={formatMonth}
              />
              <Legend />
              <Line type="monotone" dataKey="income" stroke="#00C49F" name="Доход" strokeWidth={2} />
              <Line type="monotone" dataKey="expenses" stroke="#FF8042" name="Расход" strokeWidth={2} />
              <Line type="monotone" dataKey="profit" stroke="#0088FE" name="Прибыль" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="categories-section">
        <div className="category-chart" data-testid="dashboard-top-expenses">
          <h2>Топ-5 категорий расходов</h2>
          {topCategories.expense_categories.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={topCategories.expense_categories}
                  dataKey="amount"
                  nameKey="category_name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) => `${entry.category_name}: ${parseFloat(entry.percentage).toFixed(1)}%`}
                >
                  {topCategories.expense_categories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="no-data">Нет данных</p>
          )}
        </div>

        <div className="category-chart" data-testid="dashboard-top-income">
          <h2>Топ-5 категорий доходов</h2>
          {topCategories.income_categories.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={topCategories.income_categories}
                  dataKey="amount"
                  nameKey="category_name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) => `${entry.category_name}: ${parseFloat(entry.percentage).toFixed(1)}%`}
                >
                  {topCategories.income_categories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="no-data">Нет данных</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
