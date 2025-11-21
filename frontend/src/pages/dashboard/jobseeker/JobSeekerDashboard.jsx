import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { DocumentTextIcon, ClockIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { fetchJobSeekerOverview } from '../../../store/slices/jobseekerSlice';

const JobSeekerDashboard = () => {
  const { applications, loading } = useSelector((state) => state.jobseeker);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  // Fetch job seeker data and featured jobs
  useEffect(() => {
    const fetchJobSeekerData = async () => {
      try {
        await dispatch(fetchJobSeekerOverview());
      } catch (error) {
        console.error('Error fetching job seeker data:', error);
      }
    };

    fetchJobSeekerData();
  }, [dispatch]);

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'accepted':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <DocumentTextIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  // Transform the applications data to match the expected format
  const formattedApplications = (applications || []).map((application) => {
    // Log the raw application data for debugging
    console.log('Raw application data:', application);
    
    return {
      id: application.id,
      jobId: application.job?.id,
      title: application.job?.title || 'Unknown Position',
      company: application.job?.employer?.name || 'Unknown Company',
      location: application.job?.location || 'Location not specified',
      status: application.status?.toLowerCase() || 'pending',
      appliedDate: application.appliedDate || application.createdAt,
    };
  });
  
  // Log the formatted applications for debugging
  console.log('Formatted applications:', formattedApplications);

  if (loading) {
    return <div className="text-center py-12">Loading dashboard...</div>;
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 space-y-8">
        {/* Welcome Section */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Welcome back, {user?.name || 'Job Seeker'}!
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Manage your job applications and explore new opportunities.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="pb-5 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            My Job Search
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Track the progress of every job you have applied to.
          </p>
        </div>

        <div className="mt-6">
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            {formattedApplications.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {formattedApplications.map((application) => (
                  <li key={application.id} className="hover:bg-gray-50">
                    <Link to={`/jobs/${application.jobId}`} className="block">
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            {getStatusIcon(application.status)}
                            <p className="ml-3 text-sm font-medium text-blue-600 hover:text-blue-500 truncate">
                              {application.title}
                            </p>
                          </div>
                          <div className="ml-2 flex-shrink-0 flex">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                application.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : application.status === 'accepted'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {application.status}
                            </span>
                          </div>
                        </div>
                        <div className="mt-2 sm:flex sm:justify-between">
                          <div className="sm:flex">
                            <p className="flex items-center text-sm text-gray-500">
                              {application.company}
                            </p>
                            <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                              {application.location}
                            </p>
                          </div>
                          <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                            <p>
                              Applied on{' '}
                              {application.appliedDate ? new Date(application.appliedDate).toLocaleDateString() : 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-12">
                <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No applications yet
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Start applying to jobs to track your applications here.
                </p>
                <div className="mt-6">
                  <Link
                    to="/jobs"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Browse Jobs
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobSeekerDashboard;
