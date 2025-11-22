import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}/api`;

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const getDashboardStats = async () => {
  try {
    const response = await axios.get(`${API_URL}/admin/dashboard/stats`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error.response?.data || error.message);
    throw error;
  }
};

const getRecentUsers = async () => {
  try {
    const response = await axios.get(`${API_URL}/admin/users/recent`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching recent users:', error.response?.data || error.message);
    throw error;
  }
};

const getRecentJobs = async () => {
  try {
    const response = await axios.get(`${API_URL}/admin/jobs/recent`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching recent jobs:', error.response?.data || error.message);
    throw error;
  }
};

const getAllUsers = async () => {
  try {
    const response = await axios.get(`${API_URL}/admin/users`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching all users:', error.response?.data || error.message);
    throw error;
  }
};

const getAllJobs = async () => {
  try {
    const response = await axios.get(`${API_URL}/admin/jobs`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching all jobs:', error.response?.data || error.message);
    throw error;
  }
};

const getPendingApprovals = async () => {
  try {
    const response = await axios.get(`${API_URL}/admin/approvals/pending`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching pending approvals:', error.response?.data || error.message);
    throw error;
  }
};
const createUser = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/admin/users`, userData, {
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};
const updateUser= async (userId, userData) => {
  try {
    const response = await api.put(`/admin/users/${userId}`, userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
}

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