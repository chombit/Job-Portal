import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import jobsReducer from './slices/jobSlice';
import jobseekerReducer from './slices/jobseekerSlice';
import employerReducer from './slices/employerSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    jobs: jobsReducer,
    jobseeker: jobseekerReducer,
    employer: employerReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['auth/loadUser/fulfilled'],
        ignoredActionPaths: ['meta.arg', 'payload.timestamp'],
      },
    }),
});

export default store;