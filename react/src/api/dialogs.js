import { instance } from './axios';

export const getDialogs = async () => {
  const response = await instance.get('/api/dialogs/');
  return response.data;
};

export const createDialog = async (participantId) => {
  const response = await instance.post('/api/dialogs/', {
    participant_id: participantId
  });
  return response.data;
};

export const getDialog = async (id) => {
  const response = await instance.get(`/api/dialogs/${id}/`);
  return response.data;
};

export const sendMessage = async (dialogId, text) => {
  const response = await instance.post(`/api/dialogs/${dialogId}/messages/`, {
    text
  });
  return response.data;
};
