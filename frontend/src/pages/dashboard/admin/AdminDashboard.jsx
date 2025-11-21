import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  UsersIcon,
  BriefcaseIcon,
  BuildingOffice2Icon,
  UserGroupIcon,
  ClockIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import adminService from '../../../store/services/api/admin';

const StatCard = ({ title, value, icon: Icon, link }) => (
  <div className="bg-white overflow-hidden shadow rounded-lg">
    <div className="p-5">
      <div className="flex items-center">
        <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">
              {title}
            </dt>
            <dd className="flex items-baseline">
              <div className="text-2xl font-semibold text-gray-900">
                {value}
              </div>
              {link && (
                <div className="ml-2 flex items-baseline text-sm font-semibold text-indigo-600 hover:text-indigo-500">
                  <Link to={link} className="flex items-center">
                    View all <ArrowRightIcon className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              )}
            </dd>
          </dl>
        </div>
      </div>
    </div>
  </div>
);

const RecentList = ({ title, items, type, emptyMessage }) => (
  <div className="bg-white shadow overflow-hidden sm:rounded-lg">
    <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
      <h3 className="text-lg leading-6 font-medium text-gray-900">{title}</h3>
    </div>
    <div className="bg-white overflow-hidden">
      <ul className="divide-y divide-gray-200">
        {items.length > 0 ? (
          items.map((item) => (
            <li key={item.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
              {type === 'user' ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="text-sm font-medium text-indigo-600">
                      {item.name}
                    </div>
                    <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {item.role}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-indigo-600 truncate">
                      {item.title}
                    </p>
                    <div className="ml-2 flex-shrink-0 flex">
                      <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {item.status}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 flex justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        {item.employer?.name || 'Unknown Company'}
                      </p>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              )}
            </li>
          ))
        ) : (
          <li className="px-4 py-4 text-center text-gray-500">
            {emptyMessage}
          </li>
        )}
      </ul>
    </div>
  </div>
);

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
        setLoading(true);
        
        const [statsData, usersData, jobsData] = await Promise.all([
          adminService.getDashboardStats(),
          adminService.getRecentUsers(),
          adminService.getRecentJobs(),
        ]);

        setStats(statsData);
        setRecentUsers(usersData);
        setRecentJobs(jobsData);
      } catch (error) {
        console.error('Error fetching admin dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6">
        {/* Stats */}
        <div className="grid grid-cols-1 gap-5 mt-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon={UsersIcon}
            link="/admin/users"
          />
          <StatCard
            title="Total Jobs"
            value={stats.totalJobs}
            icon={BriefcaseIcon}
            link="/admin/jobs"
          />
          <StatCard
            title="Employers"
            value={stats.totalEmployers}
            icon={BuildingOffice2Icon}
            link="/admin/users?role=employer"
          />
          <StatCard
            title="Job Seekers"
            value={stats.totalJobSeekers}
            icon={UserGroupIcon}
            link="/admin/users?role=job_seeker"
          />
          <div className="sm:col-span-2">
            <StatCard
              title="Pending Approvals"
              value={stats.pendingApprovals}
              icon={ClockIcon}
              link="/admin/approvals/pending"
            />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <RecentList
            title="Recent Users"
            items={recentUsers}
            type="user"
            emptyMessage="No recent users"
          />
          <RecentList
            title="Recent Jobs"
            items={recentJobs}
            type="job"
            emptyMessage="No recent jobs"
          />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;