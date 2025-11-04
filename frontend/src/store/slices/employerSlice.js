// src/store/slices/employerSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

// Async thunks
export const fetchEmployerProfile = createAsyncThunk(
  'employer/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch employer profile');
    }
  }
);

export const fetchPostedJobs = createAsyncThunk(
  'employer/fetchPostedJobs',
  async (_, { rejectWithValue }) => {
    try {
      console.log('Fetching employer jobs...');
      const response = await api.get('/jobs/my-jobs');
      console.log('Jobs API Response:', {
        status: response.status,
        headers: response.headers,
        data: response.data,
        isArray: Array.isArray(response.data)
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching jobs:', error);
      
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch posted jobs');
    }
  }
);
const initialState = {
  profile: null,
  postedJobs: [],
  loading: false,
  error: null,
};

const employerSlice = createSlice({
  name: 'employer',
  initialState: {
    postedJobs: [],
    loading: false,
    error: null,
  },
  extraReducers: (builder) => {
    builder
      // Fetch Profile
      .addCase(fetchEmployerProfile.pending, (state) => {
        console.log('Fetching employer profile...');
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployerProfile.fulfilled, (state, action) => {
        console.log('Profile fetch successful, updating state with:', action.payload);
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchEmployerProfile.rejected, (state, action) => {
        console.error('Profile fetch failed:', action.payload);
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Posted Jobs
      .addCase(fetchPostedJobs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPostedJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.postedJobs = action.payload || [];
        state.error = null;
      })
      .addCase(fetchPostedJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch jobs';
      });
  }
});

export const { clearEmployerError } = employerSlice.actions;
export default employerSlice.reducer;