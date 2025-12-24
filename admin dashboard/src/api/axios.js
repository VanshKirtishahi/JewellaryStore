import axios from 'axios';

// 1. DYNAMIC URL LOGIC
// Checks if a cloud URL is set; otherwise defaults to localhost.
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const instance = axios.create({
  baseURL: BASE_URL,
});

// 2. REQUEST INTERCEPTOR (Attaches Token)
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // Matches your Backend's 'allowedHeaders'
      config.headers['auth-token'] = token; 
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 3. RESPONSE INTERCEPTOR (Error Handling)
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error("Session expired or unauthorized.");
      // Optional: Redirect to login or clear storage here
      // localStorage.removeItem('token');
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default instance;