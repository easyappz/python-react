import axiosInstance from './axios';

export const getComments = async (cardId) => {
  const response = await axiosInstance.get('/api/comments/', {
    params: { card: cardId }
  });
  return response.data;
};

export const createComment = async (data) => {
  const response = await axiosInstance.post('/api/comments/', data);
  return response.data;
};

export const updateComment = async (id, data) => {
  const response = await axiosInstance.patch(`/api/comments/${id}/`, data);
  return response.data;
};

export const deleteComment = async (id) => {
  const response = await axiosInstance.delete(`/api/comments/${id}/`);
  return response.data;
};
