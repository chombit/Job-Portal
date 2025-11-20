import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { FaMapMarkerAlt, FaBriefcase, FaDollarSign, FaCalendarAlt, FaClock, FaBuilding, FaFileAlt } from 'react-icons/fa';
import { fetchJobById, applyForJob } from '../../store/slices/jobSlice';

const JobDetailsPage = () => {
  // Get the ID from URL params
  const params = useParams();
  const id = params?.id;
  // Debug the ID immediatelya
  console.log('URL Params:', params);
  console.log('Job ID from URL:', id, 'Type:', typeof id);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [resume, setResume] = useState(null);
  const [isApplying, setIsApplying] = useState(false);
  
  const { currentJob: job, loading, error } = useSelector((state) => state.jobs);
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  // Fetch job details
  useEffect(() => {
    if (id) {
      dispatch(fetchJobById(id));
    }
  }, [dispatch, id]);

  const handleApply = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error('Please log in to apply for this job');
      navigate('/login', { state: { from: `/jobs/${id}` } });
      return;
    }

    if (user.role !== 'job_seeker') {
      toast.error('Only job seekers can apply for jobs');
      return;
    }

    if (!resume) {
      toast.error('Please upload your resume');
      return;
    }

    setIsApplying(true);
    try {
      const formData = new FormData();
      formData.append('resume', resume);
      
      await dispatch(applyForJob({ 
        jobId: id, 
        applicationData: formData 
      })).unwrap();
      
      toast.success('Application submitted successfully!');
      navigate('/my-applications');
    } catch (error) {
      toast.error(error || 'Failed to submit application');
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
      setResume(file);
    }
  };

  if (loading) return <div className="text-center py-12">Loading job details...</div>;
  if (error) return <div className="text-center py-12 text-red-500">Error: {error}</div>;
  if (!job) return <div className="text-center py-12">Job not found</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Jobs
        </button>

        {/* Job Header */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8 hover:shadow-xl transition-shadow duration-300">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <FaBriefcase className="text-white text-2xl" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-3 leading-tight">{job.title}</h1>
                  <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-4">
                    <div className="flex items-center">
                      <FaBuilding className="mr-2 text-blue-500" />
                      <span className="font-medium">{job.employer?.name}</span>
                    </div>
                    <div className="flex items-center">
                      <FaMapMarkerAlt className="mr-2 text-blue-500" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center">
                      <FaClock className="mr-2 text-blue-500" />
                      <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200">
                      <FaBriefcase className="mr-2" />
                      {job.jobType?.charAt(0).toUpperCase() + job.jobType?.slice(1)}
                    </span>
                    <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {job.experienceLevel ? job.experienceLevel.charAt(0).toUpperCase() + job.experienceLevel.slice(1) + ' Level' : 'Any Experience'}
                    </span>
                    {job.isRemote && (
                      <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-purple-50 text-purple-700 border border-purple-200">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        Remote Work
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:text-right">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {job.salaryRange?.min ? (
                  <div>
                    <span className="text-4xl">${job.salaryRange.min.toLocaleString()}</span>
                    {job.salaryRange?.max && (
                      <span className="text-2xl text-gray-500"> - ${job.salaryRange.max.toLocaleString()}</span>
                    )}
                    {job.salaryRange?.period && (
                      <div className="text-sm text-gray-500 font-normal">per {job.salaryRange.period}</div>
                    )}
                  </div>
                ) : (
                  <div className="text-2xl">Salary Negotiable</div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Job Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Job Description</h2>
              <div 
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: job.description }}
              />
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Requirements</h2>
              <ul className="list-disc pl-5 space-y-2">
                {job.requirements?.map((req, index) => (
                  <li key={index}>{req}</li>
                )) || <li>No specific requirements listed</li>}
              </ul>
            </div>
          </div>

          {/* Application Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h3 className="text-lg font-semibold mb-4">Apply for this position</h3>
              
              {isAuthenticated && user.role === 'job_seeker' ? (
                <form onSubmit={handleApply}>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="resume">
                      Upload Resume (PDF/DOCX)
                    </label>
                    <input
                      type="file"
                      id="resume"
                      accept=".pdf,.doc,.docx"
                      onChange={handleResumeChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    {resume && (
                      <p className="mt-2 text-sm text-green-600">
                        <FaFileAlt className="inline mr-1" />
                        {resume.name}
                      </p>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={isApplying}
                    className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors ${
                      isApplying ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {isApplying ? 'Applying...' : 'Apply Now'}
                  </button>
                </form>
              ) : (
                <div className="text-center">
                  <p className="mb-4">Please log in as a job seeker to apply for this position.</p>
                  <button
                    onClick={() => navigate('/login', { state: { from: `/jobs/${id}` } })}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                  >
                    Log In to Apply
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetailsPage;