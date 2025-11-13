import axios from 'axios';
import { API_URL } from '../../config';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

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

const authService = {
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      const { token, user } = response.data;
      
      if (token) {
        localStorage.setItem('token', token);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
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