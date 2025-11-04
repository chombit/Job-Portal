import { api } from './authService';

const API_ENDPOINT = '/jobs';

export default {
  // Create a new job
  createJob: async (jobData) => {
    try {
      const response = await api.post(API_ENDPOINT, jobData);
      return response.data;
    } catch (error) {
      console.error('Error creating job:', error.response?.data || error.message);
      
      // Handle 401 Unauthorized (token expired/invalid)
      if (error.response?.status === 401) {
        // The interceptor in authService will handle token cleanup
        throw new Error('Your session has expired. Please log in again.');
      }
      
      // Handle other errors
      throw new Error(
        error.response?.data?.message || 
        'Failed to create job. Please try again.'
      );
    }
  },

  // Get a single job
  getJob: async (id) => {
    try {
      const response = await api.get(`${API_ENDPOINT}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching job ${id}:`, error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to fetch job details');
    }
  },

  // Update a job
  updateJob: async (id, jobData) => {
    try {
      const response = await api.put(`${API_ENDPOINT}/${id}`, jobData);
      return response.data;
    } catch (error) {
      console.error(`Error updating job ${id}:`, error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to update job');
    }
  },

  // Delete a job
  deleteJob: async (id) => {
    try {
      const response = await api.delete(`${API_ENDPOINT}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting job ${id}:`, error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to delete job');
    }
  },

  // Get jobs posted by current employer
  getMyJobs: async () => {
    try {
      const response = await api.get(`${API_ENDPOINT}/my-jobs`);
      return response.data;
    } catch (error) {
      console.error('Error fetching my jobs:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to fetch your jobs');
    }
  },
};
