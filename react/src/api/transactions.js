import instance from './axios';

/**
 * Get list of transactions with optional filters
 * @param {Object} filters - Filter parameters
 * @param {string} [filters.type] - Transaction type: 'income' or 'expense'
 * @param {number} [filters.category_id] - Category ID
 * @param {string} [filters.date_from] - Date from (YYYY-MM-DD)
 * @param {string} [filters.date_to] - Date to (YYYY-MM-DD)
 * @param {string} [filters.counterparty] - Counterparty name
 * @param {string} [filters.project] - Project name
 * @param {string} [filters.account] - Account name
 * @param {string} [filters.search] - Search query
 * @returns {Promise<Array>} List of transactions
 */
export const getTransactions = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (filters.type) params.append('type', filters.type);
    if (filters.category_id) params.append('category_id', filters.category_id);
    if (filters.date_from) params.append('date_from', filters.date_from);
    if (filters.date_to) params.append('date_to', filters.date_to);
    if (filters.counterparty) params.append('counterparty', filters.counterparty);
    if (filters.project) params.append('project', filters.project);
    if (filters.account) params.append('account', filters.account);
    if (filters.search) params.append('search', filters.search);
    
    const response = await instance.get(`/api/transactions/?${params.toString()}`);
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.detail || error.response?.data?.message || 'Не удалось загрузить транзакции';
    throw new Error(errorMessage);
  }
};

/**
 * Create new transaction
 * @param {Object} data - Transaction data
 * @param {string} data.type - Transaction type: 'income' or 'expense'
 * @param {number} data.amount - Transaction amount
 * @param {string} data.date - Transaction date (YYYY-MM-DD)
 * @param {number} data.category_id - Category ID
 * @param {string} [data.description] - Transaction description
 * @param {string} [data.counterparty] - Counterparty name
 * @param {string} [data.project] - Project name
 * @param {string} [data.account] - Account name
 * @param {string} [data.document] - Document reference
 * @returns {Promise<Object>} Created transaction
 */
export const createTransaction = async (data) => {
  try {
    const response = await instance.post('/api/transactions/', data);
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.detail || error.response?.data?.message || 'Не удалось создать транзакцию';
    throw new Error(errorMessage);
  }
};

/**
 * Get transaction by ID
 * @param {number} id - Transaction ID
 * @returns {Promise<Object>} Transaction details
 */
export const getTransaction = async (id) => {
  try {
    const response = await instance.get(`/api/transactions/${id}/`);
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.detail || error.response?.data?.message || 'Не удалось загрузить транзакцию';
    throw new Error(errorMessage);
  }
};

/**
 * Update transaction by ID
 * @param {number} id - Transaction ID
 * @param {Object} data - Transaction data to update
 * @param {string} data.type - Transaction type: 'income' or 'expense'
 * @param {number} data.amount - Transaction amount
 * @param {string} data.date - Transaction date (YYYY-MM-DD)
 * @param {number} data.category_id - Category ID
 * @param {string} [data.description] - Transaction description
 * @param {string} [data.counterparty] - Counterparty name
 * @param {string} [data.project] - Project name
 * @param {string} [data.account] - Account name
 * @param {string} [data.document] - Document reference
 * @returns {Promise<Object>} Updated transaction
 */
export const updateTransaction = async (id, data) => {
  try {
    const response = await instance.put(`/api/transactions/${id}/`, data);
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.detail || error.response?.data?.message || 'Не удалось обновить транзакцию';
    throw new Error(errorMessage);
  }
};

/**
 * Delete transaction by ID
 * @param {number} id - Transaction ID
 * @returns {Promise<void>}
 */
export const deleteTransaction = async (id) => {
  try {
    await instance.delete(`/api/transactions/${id}/`);
  } catch (error) {
    const errorMessage = error.response?.data?.detail || error.response?.data?.message || 'Не удалось удалить транзакцию';
    throw new Error(errorMessage);
  }
};

/**
 * Export transactions to CSV or Excel format
 * @param {string} format - Export format: 'csv' or 'excel'
 * @param {Object} [filters] - Optional filter parameters
 * @param {string} [filters.type] - Transaction type: 'income' or 'expense'
 * @param {number} [filters.category_id] - Category ID
 * @param {string} [filters.date_from] - Date from (YYYY-MM-DD)
 * @param {string} [filters.date_to] - Date to (YYYY-MM-DD)
 * @param {string} [filters.counterparty] - Counterparty name
 * @param {string} [filters.project] - Project name
 * @param {string} [filters.account] - Account name
 * @param {string} [filters.search] - Search query
 * @returns {Promise<Blob>} File blob
 */
export const exportTransactions = async (format, filters = {}) => {
  try {
    const params = new URLSearchParams();
    params.append('format', format);
    
    if (filters.type) params.append('type', filters.type);
    if (filters.category_id) params.append('category_id', filters.category_id);
    if (filters.date_from) params.append('date_from', filters.date_from);
    if (filters.date_to) params.append('date_to', filters.date_to);
    if (filters.counterparty) params.append('counterparty', filters.counterparty);
    if (filters.project) params.append('project', filters.project);
    if (filters.account) params.append('account', filters.account);
    if (filters.search) params.append('search', filters.search);
    
    const response = await instance.get(`/api/transactions/export/?${params.toString()}`, {
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.detail || error.response?.data?.message || 'Не удалось экспортировать транзакции';
    throw new Error(errorMessage);
  }
};
