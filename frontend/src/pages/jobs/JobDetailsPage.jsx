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
    <div className="py-12 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4">
        {/* Job Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
              <div className="flex items-center text-gray-600 mb-4">
                <FaBuilding className="mr-2" />
                <span className="mr-4">{job.employer?.name}</span>
                <FaMapMarkerAlt className="mr-2" />
                <span>{job.location}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                  {job.jobType}
                </span>
                <span className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full">
                  {job.experienceLevel || 'Any experience'}
                </span>
                {job.isRemote && (
                  <span className="bg-purple-100 text-purple-800 text-sm px-3 py-1 rounded-full">
                    Remote
                  </span>
                )}
              </div>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="text-2xl font-bold text-blue-600">
                {job.salaryRange?.min ? `$${job.salaryRange.min}` : 'Negotiable'}
                {job.salaryRange?.max && ` - $${job.salaryRange.max}`}
                {job.salaryRange?.period && ` / ${job.salaryRange.period}`}
              </div>
              <div className="text-gray-500 text-sm mt-1">
                <FaClock className="inline mr-1" />
                Posted {new Date(job.createdAt).toLocaleDateString()}
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