import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor to extract data or normalize errors
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response && error.response.data) {
      return Promise.reject(error.response.data.error || error.response.data);
    }
    return Promise.reject({
      code: 'NETWORK_ERROR',
      message: error.message || 'Unable to connect to server',
    });
  }
);

export default api;
