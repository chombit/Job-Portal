import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';


import { supabase } from '../../config/supabaseClient';

export const fetchJobSeekerProfile = createAsyncThunk(
  'jobseeker/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch profile');
    }
  }
);

export const fetchJobSeekerOverview = createAsyncThunk(
  'jobseeker/fetchOverview',
  async (_, { rejectWithValue }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: applications, error } = await supabase
        .from('applications')
        .select(`
          id,
          status,
          created_at,
          job:jobs (
            id,
            title,
            location,
            employer:profiles!employer_id (
              name
            )
          )
        `)
        .eq('applicant_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform structure to match what component expects if needed
      // The select query returns nested objects: job.title, job.employer.name
      // Component expects: application.job.title, application.job.employer.name
      // The database returns:
      // { id, status, created_at, job: { id, title, location, employer: { name } } }
      // This matches what we need.

      return {
        applications: applications || [],
      };
    } catch (error) {
      console.error('Error fetching job seeker overview:', error);
      return rejectWithValue(error.message || 'Failed to load applications');
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