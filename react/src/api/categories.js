import instance from './axios';

/**
 * Get list of categories with optional type filter
 * @param {string} [type] - Category type filter: 'income' or 'expense'
 * @returns {Promise<Array>} List of categories
 */
export const getCategories = async (type = null) => {
  try {
    const params = type ? `?type=${type}` : '';
    const response = await instance.get(`/api/categories/${params}`);
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.detail || error.response?.data?.message || 'Не удалось загрузить категории';
    throw new Error(errorMessage);
  }
};

/**
 * Create new category
 * @param {Object} data - Category data
 * @param {string} data.name - Category name
 * @param {string} data.type - Category type: 'income' or 'expense'
 * @param {string} [data.color] - Category color in hex format
 * @param {string} [data.icon] - Category icon name
 * @param {boolean} [data.is_default] - Is this a default category
 * @returns {Promise<Object>} Created category
 */
export const createCategory = async (data) => {
  try {
    const response = await instance.post('/api/categories/', data);
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.detail || error.response?.data?.message || 'Не удалось создать категорию';
    throw new Error(errorMessage);
  }
};

/**
 * Update category by ID
 * @param {number} id - Category ID
 * @param {Object} data - Category data to update
 * @param {string} data.name - Category name
 * @param {string} data.type - Category type: 'income' or 'expense'
 * @param {string} [data.color] - Category color in hex format
 * @param {string} [data.icon] - Category icon name
 * @param {boolean} [data.is_default] - Is this a default category
 * @returns {Promise<Object>} Updated category
 */
export const updateCategory = async (id, data) => {
  try {
    const response = await instance.put(`/api/categories/${id}/`, data);
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.detail || error.response?.data?.message || 'Не удалось обновить категорию';
    throw new Error(errorMessage);
  }
};

/**
 * Delete category by ID
 * @param {number} id - Category ID
 * @returns {Promise<void>}
 */
export const deleteCategory = async (id) => {
  try {
    await instance.delete(`/api/categories/${id}/`);
  } catch (error) {
    const errorMessage = error.response?.data?.detail || error.response?.data?.message || 'Не удалось удалить категорию';
    throw new Error(errorMessage);
  }
};
