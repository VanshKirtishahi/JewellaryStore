import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

console.log('API Base URL:', BASE_URL); // Debug log

const instance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // Important for CORS with credentials
  timeout: 10000,
});

// Request interceptor
instance.interceptors.request.use(
  (config) => {
    console.log('Making request to:', config.url); // Debug log
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['auth-token'] = token;
      console.log('Token attached:', token.substring(0, 20) + '...'); // Debug log
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
instance.interceptors.response.use(
  (response) => {
    console.log('Response received from:', response.config.url);
    return response;
  },
  (error) => {
    console.error('Response error:', {
      message: error.message,
      status: error.response?.status,
      url: error.config?.url,
      headers: error.response?.headers
    });
    
    if (error.response && error.response.status === 401) {
      console.error("Session expired or unauthorized.");
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    if (error.code === 'ERR_NETWORK') {
      console.error('Network error. Check CORS and server availability.');
    }
    
    return Promise.reject(error);
  }
);

export default instance;