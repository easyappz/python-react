import instance from './axios';

/**
 * Get dashboard statistics
 * @param {string} period - Period type: current_month, last_month, current_year, custom
 * @param {string} dateFrom - Start date for custom period (YYYY-MM-DD)
 * @param {string} dateTo - End date for custom period (YYYY-MM-DD)
 * @returns {Promise} Dashboard statistics
 */
export const getStats = async (period = 'current_month', dateFrom = null, dateTo = null) => {
  const params = { period };
  
  if (period === 'custom' && dateFrom && dateTo) {
    params.date_from = dateFrom;
    params.date_to = dateTo;
  }
  
  const response = await instance.get('/api/dashboard/stats/', { params });
  return response.data;
};

/**
 * Get dynamics by months
 * @param {string} period - Period type: current_month, last_month, current_year, custom
 * @param {string} dateFrom - Start date for custom period (YYYY-MM-DD)
 * @param {string} dateTo - End date for custom period (YYYY-MM-DD)
 * @returns {Promise} Dynamics data
 */
export const getDynamics = async (period = 'current_year', dateFrom = null, dateTo = null) => {
  const params = { period };
  
  if (period === 'custom' && dateFrom && dateTo) {
    params.date_from = dateFrom;
    params.date_to = dateTo;
  }
  
  const response = await instance.get('/api/dashboard/dynamics/', { params });
  return response.data;
};

/**
 * Get top categories for income and expenses
 * @param {string} period - Period type: current_month, last_month, current_year, custom
 * @param {string} dateFrom - Start date for custom period (YYYY-MM-DD)
 * @param {string} dateTo - End date for custom period (YYYY-MM-DD)
 * @param {number} limit - Number of top categories to return
 * @returns {Promise} Top categories data
 */
export const getTopCategories = async (period = 'current_month', dateFrom = null, dateTo = null, limit = 5) => {
  const params = { period, limit };
  
  if (period === 'custom' && dateFrom && dateTo) {
    params.date_from = dateFrom;
    params.date_to = dateTo;
  }
  
  const response = await instance.get('/api/dashboard/top-categories/', { params });
  return response.data;
};
