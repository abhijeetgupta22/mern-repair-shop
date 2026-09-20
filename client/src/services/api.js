import axios from 'axios';

const isLocal =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' ||
   window.location.hostname === '127.0.0.1' ||
   window.location.hostname.startsWith('192.168.') ||
   window.location.hostname.startsWith('10.') ||
   window.location.hostname.startsWith('172.'));

const API_URL =
  import.meta.env.VITE_API_URL ||
  (!isLocal ? 'https://mern-repair-shop.onrender.com/api' : '/api');

const api = axios.create({
  baseURL: API_URL,
  timeout: 45000,
  headers: {
    'Content-Type': 'application/json'
  }
});

let pendingRequestsCount = 0;
let wakeUpTimer = null;

// Request interceptor to attach JWT auth token & detect slow server wake-up
api.interceptors.request.use(
  (config) => {
    pendingRequestsCount++;
    if (!wakeUpTimer && typeof window !== 'undefined') {
      wakeUpTimer = setTimeout(() => {
        if (pendingRequestsCount > 0) {
          window.dispatchEvent(new CustomEvent('techfix_server_waking_up', { detail: { wakingUp: true } }));
        }
      }, 2500);
    }

    const token = localStorage.getItem('techfix_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    pendingRequestsCount = Math.max(0, pendingRequestsCount - 1);
    return Promise.reject(error);
  }
);

// Response interceptor to catch subscription expired, unauthorized, or network errors
api.interceptors.response.use(
  (response) => {
    pendingRequestsCount = Math.max(0, pendingRequestsCount - 1);
    if (pendingRequestsCount === 0) {
      if (wakeUpTimer) { clearTimeout(wakeUpTimer); wakeUpTimer = null; }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('techfix_server_waking_up', { detail: { wakingUp: false } }));
      }
    }
    return response;
  },
  (error) => {
    pendingRequestsCount = Math.max(0, pendingRequestsCount - 1);
    if (pendingRequestsCount === 0) {
      if (wakeUpTimer) { clearTimeout(wakeUpTimer); wakeUpTimer = null; }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('techfix_server_waking_up', { detail: { wakingUp: false } }));
      }
    }

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
    } else if (error.message && error.message.includes('Network Error')) {
      console.warn('[API] Cloud server is spinning up from idle state. Please wait...');
    }
    return Promise.reject(error);
  }
);

export { API_URL };
export default api;
