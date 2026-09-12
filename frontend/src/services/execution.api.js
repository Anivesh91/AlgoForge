import api from './api';

export const executeProblem = async (problemId, payload) => {
  const response = await api.post(`/submissions/execute/${problemId}`, payload);
  return response.data;
};
