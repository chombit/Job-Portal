import axios from 'axios';
import { API_URL } from '../../config';

// Create and export axios instance with default config
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to include token in headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth service methods
const authService = {
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      const { token, user } = response.data;
      
      if (token) {
        // Store token in localStorage
        localStorage.setItem('token', token);
        
        // Set default auth header for all future requests
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Return user data to be handled by the component/Redux
        return { user, token };
      }
      
      throw new Error('No token received');
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  },
  
  getMe: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      // Clear invalid token
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
      }
      throw error;
    }
  },
  
  logout: () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
  },
  
  getAuthHeader: () => {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }
};

export default authService;