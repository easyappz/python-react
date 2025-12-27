import axiosInstance from './axios';

export const getCards = async (columnId) => {
  const response = await axiosInstance.get('/api/cards/', {
    params: { column_id: columnId }
  });
  return response.data;
};

export const createCard = async (data) => {
  const response = await axiosInstance.post('/api/cards/', data);
  return response.data;
};

export const updateCard = async (id, data) => {
  const response = await axiosInstance.patch(`/api/cards/${id}/`, data);
  return response.data;
};

export const deleteCard = async (id) => {
  const response = await axiosInstance.delete(`/api/cards/${id}/`);
  return response.data;
};

export const moveCard = async (id, data) => {
  const response = await axiosInstance.post(`/api/cards/${id}/move/`, data);
  return response.data;
};
