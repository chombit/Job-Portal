import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import jobService from '../services/jobService';

export const createJob = createAsyncThunk(
  'jobs/createJob',
  async (jobData, { rejectWithValue }) => {
    try {
      const response = await jobService.createJob(jobData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create job'
      );
    }
  }
);

export const fetchJobs = createAsyncThunk(
  'jobs/fetchJobs',
  async (params, { rejectWithValue }) => {
    try {
      const response = await jobService.getJobs(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch jobs'
      );
    }
  }
);

export const fetchFeaturedJobs = createAsyncThunk(
  'jobs/fetchFeaturedJobs',
  async (_, { rejectWithValue }) => {
    try {
      const response = await jobService.getFeaturedJobs();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch featured jobs'
      );
    }
  }
);

export const fetchJobById = createAsyncThunk(
  'jobs/fetchById',
  async (jobId, { rejectWithValue }) => {
    try {
      console.log('Fetching job with ID in thunk:', jobId); // Debug log
      if (!jobId) {
        throw new Error('Job ID is required');
      }
      const response = await jobService.getJob(jobId);
      return response;
    } catch (error) {
      console.error('Error in fetchJobById thunk:', error); // Debug log
      return rejectWithValue(error.message);
    }
  }
);

export const updateJob = createAsyncThunk(
  'jobs/updateJob',
  async ({ jobId, jobData }, { rejectWithValue }) => {
    try {
      const response = await jobService.updateJob(jobId, jobData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update job'
      );
    }
  }
);

export const deleteJob = createAsyncThunk(
  'jobs/deleteJob',
  async (jobId, { rejectWithValue }) => {
    try {
      await jobService.deleteJob(jobId);
      return jobId; 
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete job'
      );
    }
  }
);

export const applyForJob = createAsyncThunk(
  'jobs/applyForJob',
  async ({ jobId, applicationData }, { rejectWithValue }) => {
    try {
      const response = await jobService.applyForJob(jobId, applicationData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to submit application'
      );
    }
  }
);

const initialState = {
  jobs: [],
  featuredJobs: [],
  currentJob: null,
  loading: false,
  featuredLoading: false,
  error: null,
  success: false,
  message: '',
};

const jobSlice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {
    resetJobState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
    clearCurrentJob: (state) => {
      state.currentJob = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(updateJob.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateJob.fulfilled, (state, action) => {
      state.loading = false;
      state.success = true;
      // Update the job in the jobs array if it exists there
      const index = state.jobs.findIndex(job => job._id === action.payload._id);
      if (index !== -1) {
        state.jobs[index] = action.payload;
      }
        
      if (state.currentJob?._id === action.payload._id) {
        state.currentJob = action.payload;
      }
    });
    builder.addCase(updateJob.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    builder.addCase(deleteJob.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteJob.fulfilled, (state, action) => {
      state.loading = false;
      state.success = true;
      state.jobs = state.jobs.filter(job => job._id !== action.payload);
      if (state.currentJob?._id === action.payload) {
        state.currentJob = null;
      }
    });
    builder.addCase(deleteJob.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    builder
      .addCase(createJob.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createJob.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.jobs.unshift(action.payload);
      })
      .addCase(createJob.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(applyForJob.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(applyForJob.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = 'Application submitted successfully';
        if (state.currentJob) {
          state.currentJob.hasApplied = true;
        }
      })
      .addCase(applyForJob.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(fetchJobs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.jobs = action.payload;
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(fetchFeaturedJobs.pending, (state) => {
        state.featuredLoading = true;
        state.error = null;
      })
      .addCase(fetchFeaturedJobs.fulfilled, (state, action) => {
        state.featuredLoading = false;
        state.featuredJobs = action.payload;
      })
      .addCase(fetchFeaturedJobs.rejected, (state, action) => {
        state.featuredLoading = false;
        state.error = action.payload;
      });
      
    builder
      .addCase(fetchJobById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.currentJob = null;
      })
      .addCase(fetchJobById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentJob = action.payload;
      })
      .addCase(fetchJobById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.currentJob = null;
      });
  },
});

export const { resetJobState, clearCurrentJob } = jobSlice.actions;
export default jobSlice.reducer;
