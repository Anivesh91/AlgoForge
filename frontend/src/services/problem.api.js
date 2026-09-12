import api from './api';

export const getProblems = async (params = {}) => {
  const response = await api.get('/problems', { params });
  return response.data;
};

export const getProblemById = async (id) => {
  const response = await api.get(`/problems/${id}`);
  return response.data;
};

export const saveDraft = async (id, code) => {
  const response = await api.patch(`/problems/${id}/draft`, { code });
  return response.data;
};

export const toggleSaveProblem = async (id) => {
  const response = await api.post(`/problems/${id}/save`);
  return response.data;
};

export const deleteProblem = async (id) => {
  const response = await api.delete(`/problems/${id}`);
  return response.data;
};
