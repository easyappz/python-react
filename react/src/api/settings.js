import instance from './axios';

/**
 * Get current user settings
 * @returns {Promise<Object>} User settings
 */
export const getSettings = async () => {
  try {
    const response = await instance.get('/api/settings/');
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.detail || error.response?.data?.message || 'Не удалось загрузить настройки';
    throw new Error(errorMessage);
  }
};

/**
 * Update current user settings
 * @param {Object} data - Settings data to update
 * @param {number} [data.tax_rate] - Tax rate in percentage (0-100)
 * @param {string} [data.currency] - Currency code (ISO 4217)
 * @param {string} [data.language] - Language code (ISO 639-1)
 * @param {string} [data.default_period] - Default period for reports: 'day', 'week', 'month', 'quarter', 'year'
 * @returns {Promise<Object>} Updated settings
 */
export const updateSettings = async (data) => {
  try {
    const response = await instance.put('/api/settings/', data);
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.detail || error.response?.data?.message || 'Не удалось обновить настройки';
    throw new Error(errorMessage);
  }
};
