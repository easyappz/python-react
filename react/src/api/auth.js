import instance from './axios';

export const registerUser = async (data) => {
  const response = await instance.post('/api/auth/register/', data);
  return response.data;
};

export const loginUser = async (data) => {
  const response = await instance.post('/api/auth/login/', data);
  return response.data;
};

export const logoutUser = async () => {
  const response = await instance.post('/api/auth/logout/');
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await instance.get('/api/auth/me/');
  return response.data;
};
