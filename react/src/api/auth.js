import instance from './axios';

/**
 * Register new member
 * @param {Object} data - Registration data
 * @param {string} data.email - Member email
 * @param {string} data.password - Member password
 * @param {string} data.name - Member name
 * @param {string} data.business_name - Business name
 * @returns {Promise} Response with member data
 */
export const register = async (data) => {
  const response = await instance.post('/api/auth/register/', data);
  return response.data;
};

/**
 * Login member
 * @param {Object} data - Login credentials
 * @param {string} data.email - Member email
 * @param {string} data.password - Member password
 * @returns {Promise} Response with member data
 */
export const login = async (data) => {
  const response = await instance.post('/api/auth/login/', data);
  return response.data;
};

/**
 * Logout current member
 * @returns {Promise} Response with success message
 */
export const logout = async () => {
  const response = await instance.post('/api/auth/logout/');
  return response.data;
};

/**
 * Get current authenticated member
 * @returns {Promise} Response with member data
 */
export const getMe = async () => {
  const response = await instance.get('/api/auth/me/');
  return response.data;
};
