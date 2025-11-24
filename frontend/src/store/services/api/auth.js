import { api } from '../authService';

const register = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    if (response?.data?.token) {
      localStorage.setItem('token', response.data.token);
      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
    }
    return response.data;
  } catch (error) {
    console.error('Register error:', error?.response?.data || error.message);
    throw error;
  }
};

const login = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
    if (response?.data?.token) {
      localStorage.setItem('token', response.data.token);
      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
    }
    return response.data;
  } catch (error) {
    console.error('Login error:', error?.response?.data || error.message);
    throw error;
  }
};

const getMe = async () => {
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    console.error('GetMe error:', error?.response?.data || error.message);
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
    }
    throw error;
  }
};

const logout = () => {
  localStorage.removeItem('token');
  delete api.defaults.headers.common['Authorization'];
};

const authService = {
  register,
  login,
  getMe,
  logout,
};

export default authService;