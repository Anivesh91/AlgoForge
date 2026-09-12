import api from './api';

export const getProblems = async (params = {}) => {
  const response = await api.get('/problems', { params });
  return response.data;
};

export const getProblemById = async (id) => {
  const response = await api.get(`/problems/${id}`);
  return response.data;
};

export const saveDraft = async (id, code, revision) => {
  const response = await api.patch(`/problems/${id}/draft`, { code, revision });
  return response.data;
};

export const toggleSaveProblem = async (id, isSaved) => {
  const response = await api.post(`/problems/${id}/save`, { isSaved });
  return response.data;
};

export const deleteProblem = async (id) => {
  const response = await api.delete(`/problems/${id}`);
  return response.data;
};

export const generateProblem = async (payload) => {
  const response = await api.post('/problems/generate', payload);
  return response.data;
};
