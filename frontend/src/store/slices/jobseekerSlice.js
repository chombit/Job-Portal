import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import api from '../../utils/api';

export const fetchJobSeekerProfile = createAsyncThunk(
  'jobseeker/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/jobseeker/profile');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile');
    }
  }
);

export const fetchJobSeekerOverview = createAsyncThunk(
  'jobseeker/fetchOverview',
  async (_, { rejectWithValue }) => {
    try {
      const [applicationsRes, savedJobsRes] = await Promise.all([
        api.get('/applications/me'),
      ]);

      return {
        applications: applicationsRes.data?.data || applicationsRes.data || [],
      };
    } catch (error) {
      console.error('Error fetching job seeker overview:', error);

      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }

      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to load applications');
    }
  }
);

const initialState = {
  profile: null,
  applications: [],
  loading: false,
  error: null,
};

const jobseekerSlice = createSlice({
  name: 'jobseeker',
  initialState,
  reducers: {
    clearJobSeekerError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobSeekerProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobSeekerProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchJobSeekerProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchJobSeekerOverview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobSeekerOverview.fulfilled, (state, action) => {
        state.loading = false;
        state.applications = action.payload.applications;
      })
      .addCase(fetchJobSeekerOverview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearJobSeekerError } = jobseekerSlice.actions;
export default jobseekerSlice.reducer;