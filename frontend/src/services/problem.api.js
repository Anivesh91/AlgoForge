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
  if (payload instanceof FormData) {
    const response = await api.post('/problems/generate', payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  if (payload.attachment && (payload.attachment instanceof File || payload.attachment instanceof Blob)) {
    const formData = new FormData();
    formData.append('prompt', payload.prompt);
    formData.append('difficulty', payload.difficulty || 'Medium');
    formData.append('topic', payload.topic || 'General DSA');
    if (payload.referenceMode) {
      formData.append('referenceMode', payload.referenceMode);
    }
    formData.append('reference', payload.attachment);

    const response = await api.post('/problems/generate', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  const response = await api.post('/problems/generate', payload);
  return response.data;
};
