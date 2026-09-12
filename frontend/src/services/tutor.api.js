import api from './api';

export const getConversation = async (problemId) => {
  const response = await api.get(`/problems/${problemId}/conversation`);
  return response.data;
};

export const askHint = async (problemId, { code, hintLevel }) => {
  const response = await api.post(`/problems/${problemId}/hint`, { code, hintLevel });
  return response.data;
};

export const sendChatMessage = async (problemId, { message, code, type = 'chat' }) => {
  const response = await api.post(`/problems/${problemId}/chat`, { message, code, type });
  return response.data;
};

export const clearConversation = async (problemId) => {
  const response = await api.delete(`/problems/${problemId}/conversation`);
  return response.data;
};

export const getSubmissionReview = async (submissionId, payload = {}) => {
  const response = await api.post(`/submissions/${submissionId}/review`, payload);
  return response.data;
};
