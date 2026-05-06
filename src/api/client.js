import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const client = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// Inject JWT from localStorage
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('voices_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 → redirect to login
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('voices_token');
      localStorage.removeItem('voices_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default client;
