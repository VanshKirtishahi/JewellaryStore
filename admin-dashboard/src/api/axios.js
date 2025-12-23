import axios from 'axios';

const instance = axios.create({
  // Ensure this matches your backend server URL
  baseURL: 'http://localhost:5000/api', 
});

// Request Interceptor: Attaches the token to every request
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // Your backend middleware specifically looks for 'auth-token'
      config.headers['auth-token'] = token; 
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Optional (useful for debugging)
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    // You can globally handle 401s here if you want to
    if (error.response && error.response.status === 401) {
      console.error("Unauthorized access - Token may be invalid/expired");
    }
    return Promise.reject(error);
  }
);

export default instance;