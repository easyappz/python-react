import axiosInstance from './axios';

export const getAttachments = async (cardId) => {
  const response = await axiosInstance.get('/api/attachments/', {
    params: { card: cardId }
  });
  return response.data;
};

export const uploadAttachment = async (cardId, file, filename) => {
  const formData = new FormData();
  formData.append('card', cardId);
  formData.append('file', file);
  if (filename) {
    formData.append('filename', filename);
  }
  
  const response = await axiosInstance.post('/api/attachments/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const deleteAttachment = async (id) => {
  const response = await axiosInstance.delete(`/api/attachments/${id}/`);
  return response.data;
};
