import React from 'react';

const TransactionsList = ({ transactions, categories, loading, onEdit, onDelete }) => {
  // Ensure transactions is always an array
  const safeTransactions = Array.isArray(transactions) ? transactions : [];
  const safeCategories = Array.isArray(categories) ? categories : [];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value || 0);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
  };

  const getCategoryName = (categoryId) => {
    const category = safeCategories.find(c => c.id === categoryId);
    return category ? category.name : 'Без категории';
  };

  if (loading) {
    return <div className="transactions-loading">Загрузка...</div>;
  }

  if (safeTransactions.length === 0) {
    return <div className="transactions-empty">Нет транзакций</div>;
  }

  return (
    <div className="transactions-list" data-easytag="id4-react/src/components/Transactions/TransactionsList.jsx">
      <div className="transactions-table-wrapper">
        <table className="transactions-table">
          <thead>
            <tr>
              <th>Дата</th>
              <th>Тип</th>
              <th>Категория</th>
              <th>Сумма</th>
              <th>Описание</th>
              <th>Контрагент</th>
              <th>Проект</th>
              <th>Счет</th>
              <th>Документ</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {safeTransactions.map((transaction) => (
              <tr
                key={transaction.id}
                className="transaction-row"
                data-testid={`transaction-row-${transaction.id}`}
                onClick={() => onEdit(transaction)}
              >
                <td>{formatDate(transaction.date)}</td>
                <td>
                  <span className={`transaction-type ${transaction.type}`}>
                    {transaction.type === 'income' ? 'Доход' : 'Расход'}
                  </span>
                </td>
                <td>{getCategoryName(transaction.category_id)}</td>
                <td className={`amount ${transaction.type}`}>
                  {transaction.type === 'income' ? '+' : '-'}
                  {formatCurrency(transaction.amount)}
                </td>
                <td>{transaction.description || '-'}</td>
                <td>{transaction.counterparty || '-'}</td>
                <td>{transaction.project || '-'}</td>
                <td>{transaction.account || '-'}</td>
                <td>{transaction.document || '-'}</td>
                <td>
                  <div className="transaction-actions">
                    <button
                      className="btn-icon btn-edit"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(transaction);
                      }}
                      data-testid={`transaction-edit-btn-${transaction.id}`}
                      title="Редактировать"
                    >
                      ✎
                    </button>
                    <button
                      className="btn-icon btn-delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(transaction.id);
                      }}
                      data-testid={`transaction-delete-btn-${transaction.id}`}
                      title="Удалить"
                    >
                      ✕
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="transactions-cards">
        {safeTransactions.map((transaction) => (
          <div
            key={transaction.id}
            className="transaction-card"
            data-testid={`transaction-row-${transaction.id}`}
            onClick={() => onEdit(transaction)}
          >
            <div className="transaction-card-header">
              <span className={`transaction-type ${transaction.type}`}>
                {transaction.type === 'income' ? 'Доход' : 'Расход'}
              </span>
              <span className="transaction-date">{formatDate(transaction.date)}</span>
            </div>
            <div className="transaction-card-body">
              <div className={`transaction-amount ${transaction.type}`}>
                {transaction.type === 'income' ? '+' : '-'}
                {formatCurrency(transaction.amount)}
              </div>
              <div className="transaction-category">{getCategoryName(transaction.category_id)}</div>
              {transaction.description && (
                <div className="transaction-description">{transaction.description}</div>
              )}
              {transaction.counterparty && (
                <div className="transaction-detail">
                  <strong>Контрагент:</strong> {transaction.counterparty}
                </div>
              )}
              {transaction.project && (
                <div className="transaction-detail">
                  <strong>Проект:</strong> {transaction.project}
                </div>
              )}
              {transaction.account && (
                <div className="transaction-detail">
                  <strong>Счет:</strong> {transaction.account}
                </div>
              )}
              {transaction.document && (
                <div className="transaction-detail">
                  <strong>Документ:</strong> {transaction.document}
                </div>
              )}
            </div>
            <div className="transaction-card-actions">
              <button
                className="btn-icon btn-edit"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(transaction);
                }}
                data-testid={`transaction-edit-btn-${transaction.id}`}
              >
                ✎ Редактировать
              </button>
              <button
                className="btn-icon btn-delete"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(transaction.id);
                }}
                data-testid={`transaction-delete-btn-${transaction.id}`}
              >
                ✕ Удалить
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TransactionsList;
