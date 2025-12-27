import instance from './axios';

export const getBoards = async () => {
  const response = await instance.get('/api/boards/');
  return response.data;
};

export const createBoard = async (boardData) => {
  const response = await instance.post('/api/boards/', boardData);
  return response.data;
};

export const getBoard = async (id) => {
  const response = await instance.get(`/api/boards/${id}/`);
  return response.data;
};

export const updateBoard = async (id, boardData) => {
  const response = await instance.patch(`/api/boards/${id}/`, boardData);
  return response.data;
};

export const deleteBoard = async (id) => {
  const response = await instance.delete(`/api/boards/${id}/`);
  return response.data;
};
