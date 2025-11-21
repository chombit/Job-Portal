import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

const ProfilePage = () => {
  const { user } = useSelector((state) => state.auth);

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <p className="text-gray-600">Please sign in to view your profile.</p>
          <Link
            to="/login"
            className="inline-flex mt-4 items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
          >
            Go to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-xl p-8">
          <div className="flex items-center space-x-6">
            <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center text-2xl font-semibold text-blue-600">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
              <p className="text-gray-500">{user.role?.replace('_', ' ')}</p>
            </div>
          </div>

          <dl className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="bg-gray-50 rounded-lg p-4">
              <dt className="text-sm font-medium text-gray-500">Email address</dt>
              <dd className="mt-1 text-gray-900">{user.email}</dd>
            </div>
            {user.profile_data && (
              <div className="bg-gray-50 rounded-lg p-4">
                <dt className="text-sm font-medium text-gray-500">About</dt>
                <dd className="mt-1 text-gray-900">{user.profile_data?.headline || 'Add a short bio to complete your profile.'}</dd>
              </div>
            )}
          </dl>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {user.role === 'employer' && (
              <Link
                to="/employer"
                className="inline-flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Go to Employer Dashboard
              </Link>
            )}
            {user.role === 'job_seeker' && (
              <Link
                to="/job-seeker"
                className="inline-flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Go to Job Seeker Dashboard
              </Link>
            )}
            {user.role === 'admin' && (
              <Link
                to="/admin"
                className="inline-flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Go to Admin Dashboard
              </Link>
            )}
            <Link
              to="/jobs"
              className="inline-flex items-center justify-center px-4 py-3 border border-blue-200 text-base font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50"
            >
              Browse Jobs
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
