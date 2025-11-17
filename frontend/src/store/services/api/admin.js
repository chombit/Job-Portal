import axios from 'axios';

const API_URL = 'http://localhost:5000/api/admin';

// Get auth token
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Get dashboard statistics
const getDashboardStats = async () => {
  try {
    const response = await axios.get(`${API_URL}/dashboard/stats`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error.response?.data || error.message);
    throw error;
  }
};

// Get recent users
const getRecentUsers = async () => {
  try {
    const response = await axios.get(`${API_URL}/users/recent`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching recent users:', error.response?.data || error.message);
    throw error;
  }
};

// Get recent jobs
const getRecentJobs = async () => {
  try {
    const response = await axios.get(`${API_URL}/jobs/recent`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching recent jobs:', error.response?.data || error.message);
    throw error;
  }
};

// Get all users
const getAllUsers = async () => {
  const response = await axios.get(`${API_URL}/users`, {
    headers: getAuthHeader()
  });
  return response.data;
};

// Get all jobs
const getAllJobs = async () => {
  const response = await axios.get(`${API_URL}/jobs`, {
    headers: getAuthHeader()
  });
  return response.data;
};

// Get pending approvals
const getPendingApprovals = async () => {
  const response = await axios.get(`${API_URL}/approvals/pending`, {
    headers: getAuthHeader()
  });
  return response.data;
};

const adminService = {
  getDashboardStats,
  getRecentUsers,
  getRecentJobs,
  getAllUsers,
  getAllJobs,
  getPendingApprovals,
};

export default adminService;
