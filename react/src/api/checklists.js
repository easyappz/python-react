import axiosInstance from './axios';

export const getChecklists = async (cardId) => {
  const response = await axiosInstance.get('/api/checklists/', {
    params: { card: cardId }
  });
  return response.data;
};

export const createChecklist = async (data) => {
  const response = await axiosInstance.post('/api/checklists/', data);
  return response.data;
};

export const updateChecklist = async (id, data) => {
  const response = await axiosInstance.patch(`/api/checklists/${id}/`, data);
  return response.data;
};

export const deleteChecklist = async (id) => {
  const response = await axiosInstance.delete(`/api/checklists/${id}/`);
  return response.data;
};

export const getChecklistItems = async (checklistId) => {
  const response = await axiosInstance.get('/api/checklist-items/', {
    params: { checklist: checklistId }
  });
  return response.data;
};

export const createChecklistItem = async (data) => {
  const response = await axiosInstance.post('/api/checklist-items/', data);
  return response.data;
};

export const updateChecklistItem = async (id, data) => {
  const response = await axiosInstance.patch('/api/checklist-items/', data, {
    params: { id }
  });
  return response.data;
};

export const deleteChecklistItem = async (id) => {
  const response = await axiosInstance.delete('/api/checklist-items/', {
    params: { id }
  });
  return response.data;
};
