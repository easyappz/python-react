import { instance } from './axios';

export const getDialogs = async () => {
  const response = await instance.get('/api/dialogs/');
  return response.data;
};

export const getDialog = async (id) => {
  const response = await instance.get(`/api/dialogs/${id}/`);
  return response.data;
};

export const createDialog = async (participant_id) => {
  const response = await instance.post('/api/dialogs/create/', { participant_id });
  return response.data;
};
