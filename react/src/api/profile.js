import instance from './axios';

export const updateProfile = async (firstName, lastName) => {
  const response = await instance.put('/api/profile/', {
    first_name: firstName,
    last_name: lastName,
  });
  return response.data;
};
