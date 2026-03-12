import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

console.log('API Base URL:', BASE_URL); // Debug log

const instance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 60000, // Increase to 60 seconds for cold starts
});

// Request interceptor
instance.interceptors.request.use(
  (config) => {
    console.log('Making request to:', config.url); // Debug log
    const token = localStorage.getItem('token');
    
    if (token) {
      // Ensure the header key matches what your backend expects
      config.headers['auth-token'] = token;
      // Also standard practice to include Authorization header
      config.headers['Authorization'] = `Bearer ${token}`; 
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
    const errorDetails = {
      message: error.message,
      status: error.response?.status,
      url: error.config?.url,
      headers: error.response?.headers
    };
    
    console.error('Response error:', errorDetails);
    
    // Handle Session Expiry
    if (error.response && error.response.status === 401) {
      console.error("Session expired or unauthorized.");
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Use replace to avoid back-button loops
      window.location.replace('/login'); 
    }
    
    // Handle Network/CORS Errors
    if (error.code === 'ERR_NETWORK' || !error.response) {
      console.error('Network error or CORS block. Ensure backend allows origin: ' + window.location.origin);
    }
    
    return Promise.reject(error);
  }
);

export default instance;