import axiosInstance from './axios';

export const getColumns = async (boardId) => {
  const response = await axiosInstance.get('/api/columns/', {
    params: { board_id: boardId }
  });
  return response.data;
};

export const createColumn = async (data) => {
  const response = await axiosInstance.post('/api/columns/', data);
  return response.data;
};

export const updateColumn = async (id, data) => {
  const response = await axiosInstance.patch(`/api/columns/${id}/`, data);
  return response.data;
};

export const deleteColumn = async (id) => {
  const response = await axiosInstance.delete(`/api/columns/${id}/`);
  return response.data;
};
