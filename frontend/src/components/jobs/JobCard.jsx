import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { useDispatch, useSelector } from 'react-redux';
import { deleteJob } from '../../store/slices/jobSlice';
import { PencilIcon, TrashIcon } from '@heroicons/react/outline';

const JobCard = ({ job, onEdit, isEmployer = false }) => {
  const jobId = job?._id || job?.id;
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const isJobOwner = user?.role === 'employer' && (user?._id === job.employer?._id || user?.id === job.employer?.id);

  const handleDelete = async (e) => {
    e.preventDefault();
    if (window.confirm('Are you sure you want to delete this job?')) {
      try {
        await dispatch(deleteJob(jobId)).unwrap();
      } catch (error) {
        console.error('Failed to delete job:', error);
        alert('Failed to delete job. Please try again.');
      }
    }
  };

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg group">
      <div className="px-6 py-5">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                <Link to={`/jobs/${jobId}`} className="hover:text-blue-600">
                  {job.title}
                </Link>
              </h3>
              <div className="flex items-center space-x-2">
                {isJobOwner && (
                  <>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onEdit(job);
                      }}
                      className="text-gray-400 hover:text-blue-600 p-1 rounded-full hover:bg-blue-50"
                      title="Edit job"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={handleDelete}
                      className="text-gray-400 hover:text-red-600 p-1 rounded-full hover:bg-red-50"
                      title="Delete job"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </>
                )}
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  job.job_type === 'Full-time'
                    ? 'bg-green-50 text-green-800 border border-green-100'
                    : job.job_type === 'Part-time'
                    ? 'bg-yellow-50 text-yellow-800 border border-yellow-100'
                    : job.job_type === 'Contract'
                    ? 'bg-purple-50 text-purple-800 border border-purple-100'
                    : 'bg-gray-50 text-gray-800 border border-gray-100'
                }`}>
                  {job.job_type || 'N/A'}
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-500">
              {job.employer?.companyName || job.company} • {job.location}
            </p>
          </div>
        </div>
        
        {job.description && (
          <p className="mt-3 text-sm text-gray-600 line-clamp-2">
            {job.description.replace(/<[^>]*>?/gm, '')}
          </p>
        )}
        
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {job.skills?.slice(0, 3).map((skill, index) => (
            <span 
              key={index}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
            >
              {skill}
            </span>
          ))}
          {job.skills?.length > 3 && (
            <span className="text-xs text-gray-500">
              +{job.skills.length - 3} more
            </span>
          )}
        </div>
        
        <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
          <span>Posted {job.posted_at ? formatDistanceToNow(new Date(job.posted_at), { addSuffix: true }) : 'recently'}</span>
          <Link 
            to={`/jobs/${job._id}`}
            className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center"
          >
            View details
            <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default JobCard;
