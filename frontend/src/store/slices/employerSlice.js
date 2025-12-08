import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';


import { supabase } from '../../config/supabaseClient';

export const fetchJobApplications = createAsyncThunk(
  'employer/fetchApplications',
  async (_, { rejectWithValue }) => {
    try {
      console.log('Fetching employer applications...');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Fetch applications where the job's employer_id matches current user
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          job:jobs!inner (
            id,
            title,
            employer_id
          ),
          applicant:profiles!applicant_id (
            id,
            name,
            email,
            profile_data
          )
        `)
        .eq('job.employer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log('Applications fetched:', data);

      // Wrap in data property to match expected slice structure if needed, 
      // or just return data and adjust reducer. 
      // Existing reducer expects `action.payload.data` or just `action.payload`?
      // Reducer says: `state.applications = action.payload.data || [];`
      // So let's return { data } to minimize reducer changes, or change reducer.
      // Actually changing reducer is cleaner. Let's send plain data and update reducer.
      return { data };
    } catch (error) {
      console.error('Error fetching applications:', error);
      return rejectWithValue(error.message || 'Failed to fetch applications');
    }
  }
);

export const updateApplicationStatus = createAsyncThunk(
  'employer/updateApplicationStatus',
  async ({ applicationId, status }, { rejectWithValue }) => {
    try {
      const { error } = await supabase
        .from('applications')
        .update({ status })
        .eq('id', applicationId);

      if (error) throw error;
      return { applicationId, status };
    } catch (error) {
      console.error('Error updating application status:', error);
      return rejectWithValue(error.message || 'Failed to update application status');
    }
  }
);

export const fetchEmployerProfile = createAsyncThunk(
  'employer/fetchProfile',
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
      console.error('Error fetching profile:', error);
      return rejectWithValue(error.message || 'Failed to fetch employer profile');
    }
  }
);

export const fetchPostedJobs = createAsyncThunk(
  'employer/fetchPostedJobs',
  async (_, { rejectWithValue }) => {
    try {
      console.log('Fetching employer jobs...');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('employer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log('Jobs fetched:', data);
      return data;
    } catch (error) {
      console.error('Error fetching jobs:', error);
      return rejectWithValue(error.message || 'Failed to fetch posted jobs');
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
    applications: [],
    loading: false,
    loadingApplications: false,
    error: null,
  },
  extraReducers: (builder) => {
    builder
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
      })
      .addCase(fetchJobApplications.pending, (state) => {
        state.loadingApplications = true;
        state.error = null;
      })
      .addCase(fetchJobApplications.fulfilled, (state, action) => {
        state.loadingApplications = false;
        state.applications = action.payload.data || [];
        state.error = null;
      })
      .addCase(fetchJobApplications.rejected, (state, action) => {
        state.loadingApplications = false;
        state.error = action.payload || 'Failed to fetch applications';
      })
      .addCase(updateApplicationStatus.fulfilled, (state, action) => {
        const { applicationId, status } = action.payload;
        const application = state.applications.find(app => app.id === applicationId);
        if (application) {
          application.status = status;
        }
      });
  }
});

export const { clearEmployerError } = employerSlice.actions;
export default employerSlice.reducer;