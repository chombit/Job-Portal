import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { loadUser, logout } from './store/slices/authSlice';
import { supabase } from './config/supabaseClient';
import Layout from './layouts/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import JobListingsPage from './pages/jobs/JobListingsPage';
import JobDetailsPage from './pages/jobs/JobDetailsPage';
import JobForm from './pages/jobs/JobForm';
import DashboardLayout from './layouts/DashboardLayout';
import EmployerDashboard from './pages/dashboard/employer/EmployerDashboard';
import JobSeekerDashboard from './pages/dashboard/jobseeker/JobSeekerDashboard';
import AdminDashboard from './pages/dashboard/admin/AdminDashboard';
import UsersList from './pages/admin/UsersList';
import JobsList from './pages/admin/JobsList';
import AdminLayout from './layouts/AdminLayout';
import PendingApprovals from './pages/admin/PendingApprovals';
import PrivateRoute from './components/routing/PrivateRoute';
import PublicRoute from './components/routing/PublicRoute';
import ProfilePage from './pages/ProfilePage';
import AddUserPage from './pages/admin/AddUserPage';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Initial load
    dispatch(loadUser());

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        dispatch(loadUser());
      } else if (event === 'SIGNED_OUT') {
        dispatch(logout());
      }
    });

    return () => subscription.unsubscribe();
  }, [dispatch]);

  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="jobs" element={<JobListingsPage />} />
          <Route path="jobs/:id" element={<JobDetailsPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        {/* Admin Routes */}
        <Route
          path="/admin/*"
          element={
            <PrivateRoute roles={['admin']}>
              <AdminLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<UsersList />} />
          <Route path="users/new" element={<AddUserPage />} />
          <Route path="jobs" element={<JobsList />} />
          <Route path="approvals/pending" element={<PendingApprovals />} />
        </Route>

        {/* Job Seeker Routes */}
        <Route
          path="/job-seeker/*"
          element={
            <PrivateRoute roles={['job_seeker']}>
              <DashboardLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<JobSeekerDashboard />} />
        </Route>

        {/* Employer Routes */}
        <Route
          path="/employer/*"
          element={
            <PrivateRoute roles={['employer']}>
              <DashboardLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<EmployerDashboard />} />
          <Route path="jobs/new" element={<JobForm />} />
          <Route path="jobs/:id/edit" element={<JobForm />} />
          <Route path="jobs/edit/:id" element={<Navigate to=".." replace />} />
        </Route>

        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;