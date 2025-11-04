// src/store/slices/jobseekerSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunks
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
      });
  },
});

export const { clearJobSeekerError } = jobseekerSlice.actions;
export default jobseekerSlice.reducer;