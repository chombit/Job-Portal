import { api } from '../authService';

const getDashboardStats = async () => {
  try {
    const response = await api.get('/admin/dashboard/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error.response?.data || error.message);
    throw error;
  }
};

const getRecentUsers = async () => {
  try {
    const response = await api.get('/admin/users/recent');
    return response.data;
  } catch (error) {
    console.error('Error fetching recent users:', error.response?.data || error.message);
    throw error;
  }
};

const getRecentJobs = async () => {
  try {
    const response = await api.get('/admin/jobs/recent');
    return response.data;
  } catch (error) {
    console.error('Error fetching recent jobs:', error.response?.data || error.message);
    throw error;
  }
};

const getAllUsers = async () => {
  try {
    const response = await api.get('/admin/users');
    return response.data;
  } catch (error) {
    console.error('Error fetching all users:', error.response?.data || error.message);
    throw error;
  }
};

const getAllJobs = async () => {
  try {
    const response = await api.get('/admin/jobs');
    return response.data;
  } catch (error) {
    console.error('Error fetching all jobs:', error.response?.data || error.message);
    throw error;
  }
};

const getPendingApprovals = async () => {
  try {
    const response = await api.get('/admin/approvals/pending');
    return response.data;
  } catch (error) {
    console.error('Error fetching pending approvals:', error.response?.data || error.message);
    throw error;
  }
};

const createUser = async (userData) => {
  try {
    const response = await api.post('/admin/users', userData, {
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating user:', error.response?.data || error.message);
    throw error;
  }
};

const updateUser = async (userId, userData) => {
  try {
    const response = await api.put(`/admin/users/${userId}`, userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

const adminService = {
  getDashboardStats,
  getRecentUsers,
  getRecentJobs,
  getAllUsers,
  getAllJobs,
  getPendingApprovals,
  createUser,
  updateUser,
};

export default adminService;