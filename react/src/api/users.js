import instance from './axios';

export const getUserProfile = async () => {
  const response = await instance.get('/api/users/profile/');
  return response.data;
};

export const updateUserProfile = async (profileData) => {
  const response = await instance.patch('/api/users/profile/', profileData);
  return response.data;
};
