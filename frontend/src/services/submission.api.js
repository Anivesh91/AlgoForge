import api from './api';

export const getSubmissions = async (params = {}) => {
  const response = await api.get('/submissions', { params });
  return response.data;
};

export const getSubmissionById = async (id) => {
  const response = await api.get(`/submissions/${id}`);
  return response.data;
};
