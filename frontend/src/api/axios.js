import axios from 'axios';

// CHANGE: Use the full URL of your backend server
const instance = axios.create({
  baseURL: 'http://localhost:5000/api', 
});

instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['auth-token'] = token; 
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default instance;