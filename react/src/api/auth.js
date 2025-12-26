import instance from './axios';

export const register = async (email, password, firstName, lastName) => {
  const response = await instance.post('/api/auth/register/', {
    email,
    password,
    first_name: firstName,
    last_name: lastName,
  });
  return response.data;
};

export const login = async (email, password) => {
  const response = await instance.post('/api/auth/login/', {
    email,
    password,
  });
  return response.data;
};

export const logout = async () => {
  const response = await instance.post('/api/auth/logout/');
  return response.data;
};

export const getMe = async () => {
  const response = await instance.get('/api/auth/me/');
  return response.data;
};
