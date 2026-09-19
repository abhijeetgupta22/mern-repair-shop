import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to attach JWT auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('techfix_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to catch subscription expired or unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // If subscription required/expired
      if (error.response.status === 402) {
        window.dispatchEvent(new CustomEvent('techfix_subscription_required', {
          detail: error.response.data
        }));
      }
      // If token expired
      if (error.response.status === 401 && !error.config?.url?.includes('/login')) {
        localStorage.removeItem('techfix_token');
        localStorage.removeItem('techfix_admin');
        window.location.hash = 'admin-login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
