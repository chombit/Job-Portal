import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon, CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import { fetchPostedJobs, fetchJobApplications, updateApplicationStatus } from '../../../store/slices/employerSlice';
import { deleteJob } from '../../../store/slices/jobSlice';
import { API_URL } from '../../../config';

const EmployerDashboard = () => {
  const [activeTab, setActiveTab] = useState('jobs');
  const [jobs, setJobs] = useState([]);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const { postedJobs, applications: employerApplications, loading, loadingApplications, error } = useSelector((state) => state.employer);
  console.log('EmployerDashboard - Redux state:', { loading, error, postedJobs });

  const applications = employerApplications || [];
  const loadingApps = loadingApplications;

  useEffect(() => {
    const loadJobs = async () => {
      try {
        await dispatch(fetchPostedJobs()).unwrap();
      } catch (error) {
        console.error('Error fetching jobs:', error);
      }
    };
    loadJobs();
  }, [dispatch]);

  useEffect(() => {
    const loadApplications = async () => {
      if (activeTab !== 'applications') return;

      try {
        await dispatch(fetchJobApplications()).unwrap();
      } catch (error) {
        console.error('Error fetching applications:', error);
        toast.error('Failed to load applications');
      }
    };

    loadApplications();
  }, [dispatch, activeTab]);

  useEffect(() => {
    if (!postedJobs) return;

    let jobsData = [];
    
    if (Array.isArray(postedJobs)) {
      jobsData = postedJobs;
    } else if (postedJobs.data && Array.isArray(postedJobs.data)) {
      jobsData = postedJobs.data;
    } else if (postedJobs.jobs && Array.isArray(postedJobs.jobs)) {
      jobsData = postedJobs.jobs;
    }

    console.log('Processed jobs data:', jobsData);
    setJobs(jobsData);
  }, [postedJobs]);

  const handleDeleteJob = async (jobId) => {
    if (window.confirm('Are you sure you want to delete this job posting?')) {
      try {
        await dispatch(deleteJob(jobId));
        setJobs(jobs.filter(job => job.id !== jobId));
        toast.success('Job deleted successfully');
      } catch (error) {
        console.error('Error deleting job:', error);
        toast.error('Failed to delete job');
      }
    }
  };

  const handleUpdateApplicationStatus = async (applicationId, status) => {
    try {
      await dispatch(updateApplicationStatus({ applicationId, status })).unwrap();
      toast.success(`Application ${status} successfully`);
    } catch (error) {
      console.error('Error updating application status:', error);
      toast.error('Failed to update application status');
    }
  };

  if (loading && !postedJobs) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading your dashboard...</p>
      </div>
    );
  }
  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Employer Dashboard
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Manage your job postings and track applications in one place.
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <Link
              to="/employer/jobs/new"
              className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
              Post New Job
            </Link>
          </div>
        </div>

        <div className="mt-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('jobs')}
                className={`${
                  activeTab === 'jobs'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                My Job Postings
              </button>
              <button
                onClick={() => setActiveTab('applications')}
                className={`${
                  activeTab === 'applications'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Applications
              </button>
            </nav>
          </div>
        </div>

        <div className="mt-8">
          {activeTab === 'jobs' ? (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {jobs.map((job) => (
                  <li key={job.id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium text-blue-600 truncate">
                          {job.title}
                        </div>
                        <div className="ml-2 flex-shrink-0 flex space-x-2">
                          <Link
                            to={`/employer/jobs/${job.id}/edit`}
                            className="text-gray-400 hover:text-blue-600"
                            title="Edit"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </Link>
                          <button
                            onClick={() => handleDeleteJob(job.id)}
                            className="text-gray-400 hover:text-red-600"
                            title="Delete"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            {job.company || 'Your Company'} • {job.location}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <p>
                            {job.applications?.length || 0} applications • Posted{' '}
                            {new Date(job.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              {loadingApps ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading applications...</p>
                </div>
              ) : applications.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {applications.map((application) => (
                    <li key={application.id} className="px-4 py-6 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                                <span className="text-white font-medium text-sm">
                                  {application.applicant?.name?.charAt(0).toUpperCase() || 'U'}
                                </span>
                              </div>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {application.applicant?.name || 'Unknown Applicant'}
                              </p>
                              <p className="text-sm text-gray-500">
                                Applied for: {application.job?.title || 'Unknown Job'}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                              application.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : application.status === 'reviewed'
                                ? 'bg-blue-100 text-blue-800'
                                : application.status === 'interview'
                                ? 'bg-purple-100 text-purple-800'
                                : application.status === 'accepted'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {application.status === 'pending' && <ClockIcon className="w-3 h-3 mr-1" />}
                            {application.status === 'accepted' && <CheckCircleIcon className="w-3 h-3 mr-1" />}
                            {application.status === 'rejected' && <XCircleIcon className="w-3 h-3 mr-1" />}
                            {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                          </span>
                          <div className="flex space-x-1">
                            {application.status !== 'accepted' && (
                              <button
                                onClick={() => handleUpdateApplicationStatus(application.id, 'accepted')}
                                className="text-green-600 hover:text-green-900 p-1"
                                title="Accept"
                              >
                                <CheckCircleIcon className="h-5 w-5" />
                              </button>
                            )}
                            {application.status !== 'rejected' && (
                              <button
                                onClick={() => handleUpdateApplicationStatus(application.id, 'rejected')}
                                className="text-red-600 hover:text-red-900 p-1"
                                title="Reject"
                              >
                                <XCircleIcon className="h-5 w-5" />
                              </button>
                            )}
                            <button
                              onClick={() => handleUpdateApplicationStatus(application.id, 'interview')}
                              className="text-blue-600 hover:text-blue-900 p-1"
                              title="Schedule Interview"
                            >
                              <EyeIcon className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 pl-13">
                        <div className="text-sm text-gray-600">
                          <p><strong>Email:</strong> {application.applicant?.email || 'N/A'}</p>
                          <p><strong>Applied on:</strong> {new Date(application.createdAt).toLocaleDateString()}</p>
                          {application.resume && (
                            <p>
                              <strong>Resume:</strong>
                              <a
                                href={`${API_URL.replace(/\/api\/?$/, '')}/uploads/resumes/${application.resume}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 ml-1"
                              >
                                View Resume
                              </a>
                            </p>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-12">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No applications yet</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Applications for your job postings will appear here once candidates apply.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployerDashboard;