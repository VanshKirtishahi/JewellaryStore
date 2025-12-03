import axios from 'axios';

const instance = axios.create({
  // If VITE_API_URL exists (production), use it. Otherwise use localhost.
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api', 
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['auth-token'] = token;
  }
  return config;
});

export default instance;