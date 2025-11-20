import { api } from './authService';

const API_ENDPOINT = '/jobs';

export default {
getJobs: async (params = {}) => {
  try {
    console.log('Fetching jobs with params:', params);
    const response = await api.get(API_ENDPOINT, { params });
    console.log('API Response:', response); 
    return response.data;
  } catch (error) {
    console.error('Error fetching jobs:', {
      error: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    throw error;
  }
},

  createJob: async (jobData) => {
    try {
      const response = await api.post(API_ENDPOINT, jobData);
      return response.data;
    } catch (error) {
      console.error('Error creating job:', error.response?.data || error.message);

      if (error.response?.status === 401) {
        throw new Error('Your session has expired. Please log in again.');
      }
      
      throw new Error(
        error.response?.data?.message || 
        'Failed to create job. Please try again.'
      );
    }
  },

   getJob: async (jobId) => {
    try {
      if (!jobId) {
        throw new Error('Job ID is required');
      }
      
      console.log('Fetching job with ID:', jobId);
      const response = await api.get(`${API_ENDPOINT}/${jobId}`);
      console.log('Job fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching job:', {
        error: error.message,
        jobId,
        status: error.response?.status
      });
      throw error;
    }
  },

  updateJob: async (id, jobData) => {
    try {
      const response = await api.put(`${API_ENDPOINT}/${id}`, jobData);
      return response.data;
    } catch (error) {
      console.error(`Error updating job ${id}:`, error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to update job');
    }
  },

  deleteJob: async (id) => {
    try {
      const response = await api.delete(`${API_ENDPOINT}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting job ${id}:`, error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to delete job');
    }
  },

  getFeaturedJobs: async () => {
    try {
      const response = await api.get(`${API_ENDPOINT}/featured`);
      return response.data;
    } catch (error) {
      console.error('Error fetching featured jobs:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to fetch featured jobs');
    }
  },

  getMyJobs: async () => {
    try {
      const response = await api.get(`${API_ENDPOINT}/my-jobs`);
      return response.data;
    } catch (error) {
      console.error('Error fetching my jobs:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to fetch your jobs');
    }
  },

  applyForJob: async (jobId, applicationData) => {
    try {
      const formData = new FormData();
      formData.append('resume', applicationData.resume);
      formData.append('coverLetter', applicationData.coverLetter || '');
      
      const response = await api.post(`${API_ENDPOINT}/${jobId}/apply`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error applying for job:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to submit application');
    }
  },
};
