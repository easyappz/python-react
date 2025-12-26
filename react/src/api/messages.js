import { instance } from './axios';

export const createMessage = async (dialogId, text) => {
  const response = await instance.post(`/api/dialogs/${dialogId}/messages/`, { text });
  return response.data;
};
