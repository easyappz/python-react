import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getProfitLoss, getCashFlow, getTaxReport, exportReport } from '../../api/reports';
import PeriodFilter from './PeriodFilter';
import ProfitLossReport from './ProfitLossReport';
import CashFlowReport from './CashFlowReport';
import TaxReport from './TaxReport';
import './styles.css';

const Reports = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profit_loss');
  const [period, setPeriod] = useState('current_month');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reportData, setReportData] = useState(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadReport();
  }, [activeTab, period, dateFrom, dateTo]);

  const loadReport = async () => {
    if (period === 'custom' && (!dateFrom || !dateTo)) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      let data;
      if (activeTab === 'profit_loss') {
        data = await getProfitLoss(period, dateFrom, dateTo);
      } else if (activeTab === 'cash_flow') {
        data = await getCashFlow(period, dateFrom, dateTo);
      } else if (activeTab === 'tax') {
        data = await getTaxReport(period, dateFrom, dateTo);
      }
      setReportData(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка загрузки отчета');
    } finally {
      setLoading(false);
    }
  };

  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod.period);
    setDateFrom(newPeriod.dateFrom || '');
    setDateTo(newPeriod.dateTo || '');
  };

  const handleExport = async (format) => {
    if (period === 'custom' && (!dateFrom || !dateTo)) {
      setError('Для произвольного периода необходимо указать даты');
      return;
    }

    setExporting(true);
    setError('');

    try {
      const blob = await exportReport(activeTab, format, period, dateFrom, dateTo);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const extension = format === 'pdf' ? 'pdf' : 'xlsx';
      link.download = `report_${activeTab}_${Date.now()}.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка экспорта отчета');
    } finally {
      setExporting(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="reports-page" data-easytag="id3-react/src/components/Reports/ReportsPage.jsx">
      <header className="page-header">
        <div className="header-content">
          <h1>Отчеты</h1>
          <div className="header-actions">
            <button className="btn btn-link" onClick={() => navigate('/')}>Дашборд</button>
            <button className="btn btn-link" onClick={() => navigate('/transactions')}>Транзакции</button>
            <button className="btn btn-link" onClick={() => navigate('/profile')}>Профиль</button>
            <button className="btn btn-secondary" onClick={handleLogout}>Выход</button>
          </div>
        </div>
      </header>

      <div className="reports-container">
        <div className="reports-controls">
          <div className="tabs">
            <button
              className={`tab ${activeTab === 'profit_loss' ? 'active' : ''}`}
              onClick={() => setActiveTab('profit_loss')}
              data-testid="reports-tab-profit-loss"
            >
              Прибыли и убытки
            </button>
            <button
              className={`tab ${activeTab === 'cash_flow' ? 'active' : ''}`}
              onClick={() => setActiveTab('cash_flow')}
              data-testid="reports-tab-cashflow"
            >
              Движение денежных средств
            </button>
            <button
              className={`tab ${activeTab === 'tax' ? 'active' : ''}`}
              onClick={() => setActiveTab('tax')}
              data-testid="reports-tab-tax"
            >
              Налоговый отчет
            </button>
          </div>

          <div className="controls-row">
            <PeriodFilter
              period={period}
              dateFrom={dateFrom}
              dateTo={dateTo}
              onChange={handlePeriodChange}
            />

            <div className="export-buttons">
              <button
                className="btn btn-primary"
                onClick={() => handleExport('pdf')}
                disabled={exporting || loading}
                data-testid="reports-export-btn"
              >
                {exporting ? 'Экспорт...' : 'Экспорт PDF'}
              </button>
              <button
                className="btn btn-primary"
                onClick={() => handleExport('excel')}
                disabled={exporting || loading}
              >
                {exporting ? 'Экспорт...' : 'Экспорт Excel'}
              </button>
            </div>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner">Загрузка...</div>
          </div>
        ) : (
          <div className="report-content">
            {activeTab === 'profit_loss' && <ProfitLossReport data={reportData} />}
            {activeTab === 'cash_flow' && <CashFlowReport data={reportData} />}
            {activeTab === 'tax' && <TaxReport data={reportData} />}
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
