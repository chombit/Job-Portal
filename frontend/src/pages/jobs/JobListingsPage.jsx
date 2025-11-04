import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { SearchIcon } from '@heroicons/react/outline';
import { fetchJobs } from '../../store/slices/jobSlice';
import { formatDistanceToNow } from 'date-fns';

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
              <svg
                className={`ml-1 h-5 w-5 transform transition-transform ${showFilters ? 'rotate-180' : ''}`}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="pt-4 mt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Job Type</h3>
                  <div className="space-y-2">
                    {['Full-time', 'Part-time', 'Contract', 'Internship', 'Temporary'].map((type) => (
                      <div key={type} className="flex items-center">
                        <input
                          id={`job-type-${type}`}
                          name="jobType"
                          type="checkbox"
                          value={type.toLowerCase()}
                          checked={filters.jobType.includes(type.toLowerCase())}
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

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Experience Level</h3>
                  <div className="space-y-2">
                    {['Entry Level', 'Mid Level', 'Senior', 'Lead', 'Manager'].map((level) => (
                      <div key={level} className="flex items-center">
                        <input
                          id={`exp-${level.toLowerCase().replace(' ', '-')}`}
                          name="experience"
                          type="checkbox"
                          value={level}
                          checked={filters.experience.includes(level)}
                          onChange={handleFilterChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor={`exp-${level.toLowerCase().replace(' ', '-')}`} className="ml-2 text-sm text-gray-700">
                          {level}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
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

                <div>
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
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          {showFilters && (
            <div className="md:col-span-1">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-medium text-gray-900">Filters</h2>
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="text-sm font-medium text-blue-600 hover:text-blue-500"
                  >
                    Clear all
                  </button>
                </div>

                {/* Job Type Filter */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Job Type</h3>
                  <div className="space-y-2">
                    {['Full-time', 'Part-time', 'Contract', 'Internship', 'Temporary'].map((type) => (
                      <div key={type} className="flex items-center">
                        <input
                          id={`job-type-${type.toLowerCase()}`}
                          name="jobType"
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          value={type}
                          checked={filters.jobType.includes(type)}
                          onChange={handleFilterChange}
                        />
                        <label htmlFor={`job-type-${type.toLowerCase()}`} className="ml-2 text-sm text-gray-700">
                          {type}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Experience Level Filter */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Experience Level</h3>
                  <div className="space-y-2">
                    {['Entry Level', 'Mid Level', 'Senior', 'Lead', 'Manager'].map((level) => (
                      <div key={level} className="flex items-center">
                        <input
                          id={`exp-${level.toLowerCase().replace(' ', '-')}`}
                          name="experience"
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          value={level}
                          checked={filters.experience.includes(level)}
                          onChange={handleFilterChange}
                        />
                        <label htmlFor={`exp-${level.toLowerCase().replace(' ', '-')}`} className="ml-2 text-sm text-gray-700">
                          {level}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Location Filter */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Location</h3>
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
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Salary Range</h3>
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

          {/* Jobs List */}
          <div className="md:col-span-3">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              {/* Jobs List Header */}
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="text-lg font-medium text-gray-900">
                    {jobs.length} {jobs.length === 1 ? 'Job' : 'Jobs'} Available
                  </h2>
                  <div className="mt-2 sm:mt-0">
                    <select
                      className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                      defaultValue="most-recent"
                    >
                      <option value="most-recent">Most Recent</option>
                      <option value="most-relevant">Most Relevant</option>
                      <option value="highest-salary">Highest Salary</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Loading State */}
              {loading && (
                <div className="flex justify-center items-center p-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="p-6 text-center">
                  <div className="text-red-600">Error loading jobs. Please try again later.</div>
                  <button
                    onClick={() => dispatch(fetchJobs())}
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Retry
                  </button>
                </div>
              )}

              {/* No Jobs State */}
              {!loading && !error && jobs.length === 0 && (
                <div className="p-12 text-center">
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
                      strokeWidth="1"
                      d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No jobs found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Try adjusting your search or filter to find what you're looking for.
                  </p>
                  <div className="mt-6">
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Clear all filters
                    </button>
                  </div>
                </div>
              )}

              {/* Jobs List */}
              {!loading && !error && jobs.length > 0 && (
                <ul className="divide-y divide-gray-200">
                  {jobs.map((job) => (
                    <li key={job.id} className="hover:bg-gray-50">
                      <Link to={`/jobs/${job.id}`} className="block">
                        <div className="px-6 py-4">
                          <div className="flex items-start">
                            <div className="flex-shrink-0 h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl">
                              {job.employer?.name?.charAt(0) || 'C'}
                            </div>
                            <div className="ml-4 flex-1">
                              <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600">
                                  {job.title}
                                </h3>
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    job.job_type === 'Full-time'
                                      ? 'bg-green-100 text-green-800'
                                      : job.job_type === 'Part-time'
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : job.job_type === 'Contract'
                                      ? 'bg-purple-100 text-purple-800'
                                      : 'bg-gray-100 text-gray-800'
                                  }`}
                                >
                                  {job.job_type || 'N/A'}
                                </span>
                              </div>
                              <p className="mt-1 text-sm font-medium text-gray-700">
                                {job.employer?.name || job.employer?.companyName || 'Company not specified'}
                              </p>
                              
                              <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                                <div className="flex items-center">
                                  <svg
                                    className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                  {job.location || 'Location not specified'}
                                </div>
                                
                                {job.salary_range && (
                                  <div className="flex items-center">
                                    <svg
                                      className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                                      xmlns="http://www.w3.org/2000/svg"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                      />
                                    </svg>
                                    {job.salary_range}
                                  </div>
                                )}
                                
                                {job.experience_level && (
                                  <div className="flex items-center">
                                    <svg
                                      className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                                      xmlns="http://www.w3.org/2000/svg"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M12 16h.01M16 12h.01M12 12h.01M8 12h.01"
                                      />
                                    </svg>
                                    {job.experience_level}
                                  </div>
                                )}
                                
                                <div className="flex items-center ml-auto">
                                  <svg
                                    className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    />
                                  </svg>
                                  {job.createdAt 
                                    ? formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })
                                    : 'Recently'}
                                </div>
                              </div>
                              
                              <div className="mt-3 flex justify-between items-center">
                                <div className="flex -space-x-2">
                                  {['React', 'Node.js', 'JavaScript'].slice(0, 3).map((skill, i) => (
                                    <span
                                      key={i}
                                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                    >
                                      {skill}
                                    </span>
                                  ))}
                                </div>
                                <span className="inline-flex items-center text-sm font-medium text-blue-600 group-hover:text-blue-500">
                                  View details
                                  <svg
                                    className="ml-1 w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M9 5l7 7-7 7"
                                    ></path>
                                  </svg>
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobListingsPage;