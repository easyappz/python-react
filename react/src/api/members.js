import { instance } from './axios';

export const getMembers = async (search = '') => {
  const params = search ? { search } : {};
  const response = await instance.get('/api/members/', { params });
  return response.data;
};

export const getMember = async (id) => {
  const response = await instance.get(`/api/members/${id}/`);
  return response.data;
};

export const updateMember = async (id, data) => {
  const response = await instance.patch(`/api/members/${id}/`, data);
  return response.data;
};
