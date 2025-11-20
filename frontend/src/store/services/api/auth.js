import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth'; // Update with your backend URL

const register = async (userData) => {
  const response = await axios.post(`${API_URL}/register`, userData);
  if (response.data) {
    localStorage.setItem('token', response.data.token);
  }
  return response.data;
};

const login = async (credentials) => {
  const response = await axios.post(`${API_URL}/login`, credentials);
  if (response.data) {
    localStorage.setItem('token', response.data.token);
  }
  return response.data;
};
const getMe = async () => {
  const token = localStorage.getItem('token');
  const response = await axios.get(`${API_URL}/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

const authService = {
  register,
  login,
  getMe,
};

export default authService;