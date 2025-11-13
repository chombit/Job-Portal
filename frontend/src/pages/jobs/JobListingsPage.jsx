import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { SearchIcon } from '@heroicons/react/outline';
import { fetchJobs } from '../../store/slices/jobSlice';
import JobCard from '../../components/jobs/JobCard';

const JobListingsPage = () => {
  const dispatch = useDispatch();
  const { jobs = [], loading, error } = useSelector((state) => state.jobs);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    jobType: [],
    experience: [],
    location: '',
    salaryRange: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();
  
  // Fetch jobs when component mounts
  useEffect(() => {
    dispatch(fetchJobs());
  }, [dispatch]);
  
  // Log jobs data for debugging
  useEffect(() => {
    if (jobs) {
      console.log('Jobs data:', jobs);
    }
  }, [jobs]);

  const handleSearch = (e) => {
    e.preventDefault();
    // Handle search
  };

  const handleFilterChange = (e) => {
    const { name, value, checked } = e.target;
    if (name === 'jobType' || name === 'experience') {
      setFilters((prev) => ({
        ...prev,
        [name]: checked
          ? [...prev[name], value]
          : prev[name].filter((item) => item !== value),
      }));
    } else {
      setFilters((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const clearFilters = () => {
    setFilters({
      jobType: [],
      experience: [],
      location: '',
      salaryRange: '',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight mb-6">Find Your Dream Job</h1>
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl">
            <div className="flex rounded-lg shadow-sm">
              <div className="relative flex-grow focus-within:z-10">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SearchIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  type="text"
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full rounded-l-lg pl-10 sm:text-sm border-gray-300 text-gray-900"
                  placeholder="Search for jobs, companies, or keywords"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button
                type="submit"
                className="-ml-px relative inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-lg text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Search
              </button>
            </div>
          </form>
          
          {/* Filter Toggle */}
          <div className="mt-4">
            <button
              type="button"
              className="inline-flex items-center text-sm font-medium text-blue-100 hover:text-white"
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? 'Hide filters' : 'Show filters'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters Sidebar */}
          {showFilters && (
            <div className="w-full md:w-64 flex-shrink-0">
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium">Filters</h2>
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Clear all
                  </button>
                </div>
                
                {/* Job Type Filter */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Job Type</h3>
                  <div className="space-y-2">
                    {['Full-time', 'Part-time', 'Contract', 'Internship'].map((type) => (
                      <div key={type} className="flex items-center">
                        <input
                          id={`job-type-${type}`}
                          name="jobType"
                          type="checkbox"
                          value={type}
                          checked={filters.jobType.includes(type)}
                          onChange={handleFilterChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor={`job-type-${type}`} className="ml-2 text-sm text-gray-700">
                          {type}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Experience Level Filter */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Experience Level</h3>
                  <div className="space-y-2">
                    {['Entry Level', 'Mid Level', 'Senior', 'Lead'].map((level) => (
                      <div key={level} className="flex items-center">
                        <input
                          id={`exp-${level}`}
                          name="experience"
                          type="checkbox"
                          value={level}
                          checked={filters.experience.includes(level)}
                          onChange={handleFilterChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor={`exp-${level}`} className="ml-2 text-sm text-gray-700">
                          {level}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Location Filter */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Location</h3>
                  <input
                    type="text"
                    name="location"
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="City, state, or remote"
                    value={filters.location}
                    onChange={handleFilterChange}
                  />
                </div>

                {/* Salary Range Filter */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Salary Range</h3>
                  <select
                    name="salaryRange"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    value={filters.salaryRange}
                    onChange={handleFilterChange}
                  >
                    <option value="">All salaries</option>
                    <option value="0-50000">$0 - $50,000</option>
                    <option value="50000-100000">$50,000 - $100,000</option>
                    <option value="100000-150000">$100,000 - $150,000</option>
                    <option value="150000+">$150,000+</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Job Listings */}
          <div className="flex-1">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : error ? (
              <div className="bg-red-50 border-l-4 border-red-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">
                      {error}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {jobs.length > 0 ? (
                  jobs.map((job) => (
                    <JobCard 
                      key={job._id || job.id} 
                      job={job} 
                      onEdit={(jobToEdit) => {
                        const id = jobToEdit._id || jobToEdit.id;
                        navigate(`/employer/jobs/edit/${id}`);
                      }}
                    />
                  ))
                ) : (
                  <div className="text-center py-12">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No jobs found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Try adjusting your search or filter to find what you're looking for.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobListingsPage;
