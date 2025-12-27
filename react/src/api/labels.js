import axiosInstance from './axios';

export const getLabels = async (boardId) => {
  const response = await axiosInstance.get('/api/labels/', {
    params: { board: boardId }
  });
  return response.data;
};

export const createLabel = async (data) => {
  const response = await axiosInstance.post('/api/labels/', data);
  return response.data;
};

export const updateLabel = async (id, data) => {
  const response = await axiosInstance.patch(`/api/labels/${id}/`, data);
  return response.data;
};

export const deleteLabel = async (id) => {
  const response = await axiosInstance.delete(`/api/labels/${id}/`);
  return response.data;
};
