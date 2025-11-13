import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  UsersIcon,
  BriefcaseIcon,
  ChartBarIcon,
  UserGroupIcon,
  ClockIcon,
} from '@heroicons/react/outline';


const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalJobs: 0,
    totalEmployers: 0,
    totalJobSeekers: 0,
    pendingApprovals: 0,
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
  try {
    setStats({
      totalUsers: 24,
      totalJobs: 15,
      totalEmployers: 8,
      totalJobSeekers: 16,
      pendingApprovals: 3,
    });

    setRecentUsers([
      {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        role: 'job_seeker',
        createdAt: new Date().toISOString(),
      },
    ]);

    setRecentJobs([
      {
        id: 1,
        title: 'FullStack Developer',
        company: 'Tech Corp',
        location: 'Remote',
        status: 'active',
        postedAt: new Date().toISOString(),
        skills: ['React', 'JavaScript', 'TypeScript'],
      },
    ]);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching admin dashboard data:', error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className="text-center py-12">Loading dashboard...</div>;
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h1>

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                  <UsersIcon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Users
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {stats.totalUsers}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-4 sm:px-6">
              <div className="text-sm">
                <Link
                  to="/admin/users"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  View all
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                  <BriefcaseIcon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Jobs
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {stats.totalJobs}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-4 sm:px-6">
              <div className="text-sm">
                <Link
                  to="/admin/jobs"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  View all
                </Link>
              </div>
            </div>
          </div>

          {/* Total Employers */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                  <UserGroupIcon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Employers
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {stats.totalEmployers}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-4 sm:px-6">
              <div className="text-sm">
                <Link
                  to="/admin/employers"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  View all
                </Link>
              </div>
            </div>
          </div>

          {/* Total Job Seekers */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                  <UserGroupIcon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Job Seekers
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {stats.totalJobSeekers}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-4 sm:px-6">
              <div className="text-sm">
                <Link
                  to="/admin/job-seekers"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  View all
                </Link>
              </div>
            </div>
          </div>

          {/* Pending Approvals */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-red-500 rounded-md p-3">
                  <ClockIcon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Pending Approvals
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {stats.pendingApprovals}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-4 sm:px-6">
              <div className="text-sm">
                <Link
                  to="/admin/approvals"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Review
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Recent Users */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
              <h3 className="text-lg font-medium text-gray-900">Recent Users</h3>
            </div>
            <ul className="divide-y divide-gray-200">
              {recentUsers.length > 0 ? (
                recentUsers.map((user) => (
                  <li key={user.id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-blue-600 truncate">
                          {user.name}
                        </p>
                        <div className="ml-2 flex-shrink-0 flex">
                          <p
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              user.role === 'admin'
                                ? 'bg-purple-100 text-purple-800'
                                : user.role === 'employer'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {user.role}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            {user.email}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <p>
                            Joined{' '}
                            {new Date(user.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </li>
                ))
              ) : (
                <div className="px-4 py-12 text-center text-gray-500">
                  No recent users
                </div>
              )}
            </ul>
            <div className="bg-gray-50 px-4 py-4 sm:px-6 text-right text-sm">
              <Link
                to="/admin/users"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                View all users
              </Link>
            </div>
          </div>

          {/* Recent Jobs */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
              <h3 className="text-lg font-medium text-gray-900">Recent Jobs</h3>
            </div>
            <ul className="divide-y divide-gray-200">
              {recentJobs.length > 0 ? (
                recentJobs.map((job) => (
                  <li key={job.id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-blue-600 truncate">
                          {job.title}
                        </p>
                        <div className="ml-2 flex-shrink-0 flex">
                          <p
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              job.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {job.status}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            {job.company}
                          </p>
                          <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                            {job.location}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <p>
                            Posted {new Date(job.postedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2">
                        {job.skills?.slice(0, 3).map((skill) => (
                          <span
                            key={skill}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </li>
                ))
              ) : (
                <div className="px-4 py-12 text-center text-gray-500">
                  No recent jobs
                </div>
              )}
            </ul>
            <div className="bg-gray-50 px-4 py-4 sm:px-6 text-right text-sm">
              <Link
                to="/admin/jobs"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                View all jobs
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;