import api from './api';

export const getSubmissions = async () => {
  const response = await api.get('/submissions');
  return response.data;
};

export const getSubmissionById = async (id) => {
  const response = await api.get(`/submissions/${id}`);
  return response.data;
};
