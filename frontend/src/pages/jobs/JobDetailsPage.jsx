import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeftIcon, BookmarkIcon, ShareIcon, ExternalLinkIcon } from '@heroicons/react/outline';
import { toast } from 'react-hot-toast';

const JobDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { job, loading, error } = useSelector((state) => state.jobs);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [isApplying, setIsApplying] = useState(false);
  const [resume, setResume] = useState(null);

  // Fetch job details on component mount
  useEffect(() => {
    // dispatch(fetchJobById(id));
  }, [dispatch, id]);

  const handleApply = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to apply for this job');
      navigate('/login', { state: { from: `/jobs/${id}` } });
      return;
    }

    if (user.role !== 'job_seeker') {
      toast.error('Only job seekers can apply for jobs');
      return;
    }

    setIsApplying(true);
    try {
      // Handle file upload and application submission
      // await dispatch(applyForJob({ jobId: id, resume }));
      toast.success('Application submitted successfully!');
      navigate('/applications');
    } catch (error) {
      toast.error(error.message || 'Failed to submit application');
    } finally {
      setIsApplying(false);
    }
  };

  const handleResumeChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should be less than 5MB');
        return;
      }
      if (!['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)) {
        toast.error('Please upload a PDF or Word document');
        return;
      }
      setResume(file);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading job details...</div>;
  }

  if (error) {
    return <div className="text-center py-12 text-red-500">{error}</div>;
  }

  if (!job) {
    return <div className="text-center py-12">Job not found</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-1" />
          Back to jobs
        </button>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
              <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6">
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <svg
                    className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z"
                      clipRule="evenodd"
                    />
                    <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
                  </svg>
                  {job.company}
                </div>
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <svg
                    className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {job.location}
                </div>
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <svg
                    className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Posted on {new Date(job.postedAt).toLocaleDateString()}
                </div>
              </div>
            </div>
            <div className="mt-4 flex sm:mt-0 sm:ml-4">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <BookmarkIcon className="-ml-1 mr-2 h-5 w-5 text-gray-400" />
                Save
              </button>
              <button
                type="button"
                className="ml-3 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <ShareIcon className="-ml-1 mr-2 h-5 w-5 text-gray-400" />
                Share
              </button>
            </div>
          </div>
        </div>
        <div className="px-4 py-5 sm:px-6">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="prose max-w-none">
                <h2 className="text-lg font-medium text-gray-900">Job Description</h2>
                <div
                  className="mt-4 text-gray-700"
                  dangerouslySetInnerHTML={{ __html: job.description }}
                />

                <h2 className="mt-8 text-lg font-medium text-gray-900">Requirements</h2>
                <ul className="mt-2 list-disc pl-5 text-gray-700">
                  {job.requirements?.map((req, index) => (
                    <li key={index}>{req}</li>
                  ))}
                </ul>

                <h2 className="mt-8 text-lg font-medium text-gray-900">Responsibilities</h2>
                <ul className="mt-2 list-disc pl-5 text-gray-700">
                  {job.responsibilities?.map((resp, index) => (
                    <li key={index}>{resp}</li>
                  ))}
                </ul>

                <h2 className="mt-8 text-lg font-medium text-gray-900">Skills</h2>
                <div className="mt-2 flex flex-wrap gap-2">
                  {job.skills?.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Job Overview</h2>
                <dl className="mt-4 space-y-4">
                  <div className="flex items-start">
                    <dt className="w-32 text-sm font-medium text-gray-500">Job Type</dt>
                    <dd className="text-sm text-gray-900 capitalize">{job.jobType}</dd>
                  </div>
                  <div className="flex items-start">
                    <dt className="w-32 text-sm font-medium text-gray-500">Experience</dt>
                    <dd className="text-sm text-gray-900 capitalize">{job.experienceLevel}</dd>
                  </div>
                  <div className="flex items-start">
                    <dt className="w-32 text-sm font-medium text-gray-500">Salary</dt>
                    <dd className="text-sm text-gray-900">
                      {job.salaryRange?.min && job.salaryRange?.max
                        ? `$${job.salaryRange.min.toLocaleString()} - $${job.salaryRange.max.toLocaleString()} per ${job.salaryRange.period || 'year'}`
                        : 'Negotiable'}
                    </dd>
                  </div>
                  <div className="flex items-start">
                    <dt className="w-32 text-sm font-medium text-gray-500">Location</dt>
                    <dd className="text-sm text-gray-900">{job.location}</dd>
                  </div>
                  <div className="flex items-start">
                    <dt className="w-32 text-sm font-medium text-gray-500">Remote</dt>
                    <dd className="text-sm text-gray-900">
                      {job.isRemote ? 'Yes' : 'No'}
                    </dd>
                  </div>
                  <div className="flex items-start">
                    <dt className="w-32 text-sm font-medium text-gray-500">Posted</dt>
                    <dd className="text-sm text-gray-900">
                      {new Date(job.postedAt).toLocaleDateString()}
                    </dd>
                  </div>
                </dl>

                <div className="mt-6">
                  <h3 className="text-sm font-medium text-gray-900">How to Apply</h3>
                  <p className="mt-2 text-sm text-gray-600">
                    {job.howToApply ||
                      'Click the apply button below to submit your application.'}
                  </p>
                </div>

                <div className="mt-6">
                  {isAuthenticated && user.role === 'job_seeker' ? (
                    <div>
                      <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                        <div className="space-y-1 text-center">
                          <svg
                            className="mx-auto h-12 w-12 text-gray-400"
                            stroke="currentColor"
                            fill="none"
                            viewBox="0 0 48 48"
                            aria-hidden="true"
                          >
                            <path
                              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          <div className="flex text-sm text-gray-600">
                            <label
                              htmlFor="resume-upload"
                              className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                            >
                              <span>Upload a file</span>
                              <input
                                id="resume-upload"
                                name="resume-upload"
                                type="file"
                                className="sr-only"
                                onChange={handleResumeChange}
                                accept=".pdf,.doc,.docx"
                              />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                          <p className="text-xs text-gray-500">
                            PDF or Word up to 5MB
                          </p>
                          {resume && (
                            <p className="text-sm text-green-600 mt-2">
                              {resume.name} selected
                            </p>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleApply}
                        disabled={isApplying || !resume}
                        className={`mt-4 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                          isApplying || !resume
                            ? 'bg-blue-300 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700'
                        } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                      >
                        {isApplying ? 'Applying...' : 'Apply Now'}
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        navigate('/login', { state: { from: `/jobs/${id}` } })
                      }
                      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Sign in to Apply
                    </button>
                  )}
                </div>

                <div className="mt-6 border-t border-gray-200 pt-6">
                  <h3 className="text-sm font-medium text-gray-900">About {job.company}</h3>
                  <p className="mt-2 text-sm text-gray-600">
                    {job.companyDescription ||
                      'A leading company in the industry, dedicated to innovation and excellence.'}
                  </p>
                  <div className="mt-4">
                    <a
                      href={job.companyWebsite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
                    >
                      Visit website
                      <ExternalLinkIcon className="ml-1 h-4 w-4" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetailsPage;