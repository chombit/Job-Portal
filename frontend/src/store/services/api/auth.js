import axios from 'axios';

// Create axios instance with base URL from environment variables
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include the token
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

const API_URL = `${import.meta.env.VITE_API_URL}/auth`;

const register = async (userData) => {
  try {
    const response = await api.post(`${API_URL}/register`, userData);
    if (response.data?.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  } catch (error) {
    console.error('Registration error:', error.response?.data || error.message);
    throw error.response?.data || { message: 'Registration failed' };
  }
};

const login = async (credentials) => {
  try {
    const response = await api.post(`${API_URL}/login`, credentials);
    if (response.data?.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  } catch (error) {
    console.error('Login error:', error.response?.data || error.message);
    throw error.response?.data || { message: 'Login failed' };
  }
};

const getMe = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await api.get(`${API_URL}/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Get user error:', error.response?.data || error.message);
    throw error.response?.data || { message: 'Failed to fetch user data' };
  }
};

const logout = () => {
  localStorage.removeItem('token');
  // Clear any other user-related data
};

const authService = {
  register,
  login,
  getMe,
  logout
};

export default authService;