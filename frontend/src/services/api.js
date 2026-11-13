import axios from 'axios';

// Backend URL configured for Render deployment with local fallback
const rawBaseUrl = import.meta.env.VITE_API_URL || 'https://bakery-vjhc.onrender.com';
const API_BASE_URL = rawBaseUrl.replace(/\/+$/, '');

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Attach JWT Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('bakery_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';
    
    // Check if token expired
    if (error.response?.status === 401) {
      const isAuthEndpoint =
        error.config.url.includes('/auth/owner/login') ||
        error.config.url.includes('/auth/customer/verify-otp') ||
        error.config.url.includes('/auth/customer/send-otp');
      
      if (!isAuthEndpoint && localStorage.getItem('bakery_token')) {
        localStorage.removeItem('bakery_token');
        localStorage.removeItem('bakery_user');
      }
    }
    return Promise.reject(new Error(message));
  }
);

export default api;
