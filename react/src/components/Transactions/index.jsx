import React, { useState, useEffect } from 'react';
import { getTransactions, deleteTransaction, exportTransactions } from '../../api/transactions';
import { getCategories } from '../../api/categories';
import TransactionsList from './TransactionsList';
import TransactionForm from './TransactionForm';
import TransactionFilters from './TransactionFilters';
import './styles.css';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [filters, setFilters] = useState({
    type: '',
    category_id: '',
    date_from: '',
    date_to: '',
    counterparty: '',
    project: '',
    account: '',
    search: ''
  });

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [filters]);

  const loadCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  const loadTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      const cleanFilters = {};
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          cleanFilters[key] = filters[key];
        }
      });
      const data = await getTransactions(cleanFilters);
      setTransactions(data);
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Не удалось загрузить транзакции');
      setLoading(false);
    }
  };

  const handleAddTransaction = () => {
    setEditingTransaction(null);
    setIsFormOpen(true);
  };

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    setIsFormOpen(true);
  };

  const handleDeleteTransaction = async (id) => {
    if (window.confirm('Вы уверены, что хотите удалить эту транзакцию?')) {
      try {
        await deleteTransaction(id);
        await loadTransactions();
      } catch (err) {
        alert(err.message || 'Не удалось удалить транзакцию');
      }
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingTransaction(null);
  };

  const handleFormSuccess = async () => {
    handleFormClose();
    await loadTransactions();
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleExport = async (format) => {
    try {
      const cleanFilters = {};
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          cleanFilters[key] = filters[key];
        }
      });
      const blob = await exportTransactions(format, cleanFilters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transactions.${format === 'csv' ? 'csv' : 'xlsx'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert(err.message || 'Не удалось экспортировать транзакции');
    }
  };

  return (
    <div className="transactions-page" data-easytag="id3-react/src/components/Transactions/index.jsx">
      <div className="transactions-container">
        <div className="transactions-header">
          <h1>Транзакции</h1>
          <div className="transactions-actions">
            <button
              className="btn btn-export"
              onClick={() => handleExport('csv')}
              data-testid="export-transactions-btn"
            >
              Экспорт CSV
            </button>
            <button
              className="btn btn-export"
              onClick={() => handleExport('excel')}
            >
              Экспорт Excel
            </button>
            <button
              className="btn btn-primary"
              onClick={handleAddTransaction}
              data-testid="add-transaction-btn"
            >
              + Добавить транзакцию
            </button>
          </div>
        </div>

        <TransactionFilters
          filters={filters}
          categories={categories}
          onChange={handleFiltersChange}
        />

        {error && <div className="transactions-error">{error}</div>}

        <TransactionsList
          transactions={transactions}
          categories={categories}
          loading={loading}
          onEdit={handleEditTransaction}
          onDelete={handleDeleteTransaction}
        />

        {isFormOpen && (
          <TransactionForm
            transaction={editingTransaction}
            categories={categories}
            onClose={handleFormClose}
            onSuccess={handleFormSuccess}
          />
        )}
      </div>
    </div>
  );
};

export default Transactions;
