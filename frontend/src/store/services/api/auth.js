import { api } from '../authService';

const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  if (response.data?.token) {
    localStorage.setItem('token', response.data.token);
    api.defaults.headers.common.Authorization = `Bearer ${response.data.token}`;
  }
  return response.data;
};

const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  if (response.data?.token) {
    localStorage.setItem('token', response.data.token);
    api.defaults.headers.common.Authorization = `Bearer ${response.data.token}`;
  }
  return response.data;
};

const getMe = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

const authService = {
  register,
  login,
  getMe,
};

export default authService;