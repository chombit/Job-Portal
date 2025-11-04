import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
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
import PrivateRoute from './components/routing/PrivateRoute';
import PublicRoute from './components/routing/PublicRoute';
import TestPage from './pages/TestPage';

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Layout />}>
        <Route path="test" element={<TestPage />} />
        <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
          <Route index element={<HomePage />} />
          <Route path="jobs" element={<JobListingsPage />} />
          <Route path="jobs/:id" element={<JobDetailsPage />} />
          
          
        </Route>

        {/* Protected Routes */}
        <Route element={<PrivateRoute allowedRoles={['job_seeker']} />}>
          <Route path="/job-seeker" element={<DashboardLayout />}>
            <Route index element={<JobSeekerDashboard />} />
            {/* Add more job seeker routes here */}
          </Route>
        </Route>

        <Route element={<PrivateRoute allowedRoles={['employer']} />}>
          <Route path="/employer" element={<DashboardLayout />}>
            <Route index element={<EmployerDashboard />} />
            <Route path="jobs/new" element={<JobForm />} />
            {/* Add more employer routes here */}
          </Route>
        </Route>

        <Route element={<PrivateRoute allowedRoles={['admin']} />}>
          <Route path="/admin" element={<DashboardLayout />}>
            <Route index element={<AdminDashboard />} />
            {/* Add other admin routes here */}
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;