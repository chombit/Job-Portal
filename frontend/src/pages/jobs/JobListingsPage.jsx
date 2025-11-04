import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { SearchIcon } from '@heroicons/react/outline';

const JobListingsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    jobType: [],
    experience: [],
    location: '',
    salaryRange: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const { jobs, loading, error } = useSelector((state) => state.jobs);
  const dispatch = useDispatch();

  // Fetch jobs on component mount
  useEffect(() => {
    // dispatch(fetchJobs());
  }, [dispatch]);

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Job Listings</h1>
        <p className="mt-2 text-sm text-gray-500">
          Browse through our latest job openings
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Search and Filters */}
        <div className="w-full md:w-1/4">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">Filters</h2>
              <button
                type="button"
                className="text-sm text-blue-600 hover:text-blue-500"
                onClick={clearFilters}
              >
                Clear all
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="search"
                  className="block text-sm font-medium text-gray-700"
                >
                  Search
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SearchIcon
                      className="h-5 w-5 text-gray-400"
                      aria-hidden="true"
                    />
                  </div>
                  <input
                    type="text"
                    name="search"
                    id="search"
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                    placeholder="Job title or company"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-900">Job Type</h3>
                <div className="mt-2 space-y-2">
                  {['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'].map(
                    (type) => (
                      <div key={type} className="flex items-center">
                        <input
                          id={`job-type-${type.toLowerCase()}`}
                          name="jobType"
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          value={type.toLowerCase()}
                          checked={filters.jobType.includes(type.toLowerCase())}
                          onChange={handleFilterChange}
                        />
                        <label
                          htmlFor={`job-type-${type.toLowerCase()}`}
                          className="ml-3 text-sm text-gray-700"
                        >
                          {type}
                        </label>
                      </div>
                    )
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-900">
                  Experience Level
                </h3>
                <div className="mt-2 space-y-2">
                  {['Entry Level', 'Mid Level', 'Senior', 'Lead', 'Executive'].map(
                    (level) => (
                      <div key={level} className="flex items-center">
                        <input
                          id={`exp-${level.toLowerCase().replace(' ', '-')}`}
                          name="experience"
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          value={level.toLowerCase()}
                          checked={filters.experience.includes(
                            level.toLowerCase()
                          )}
                          onChange={handleFilterChange}
                        />
                        <label
                          htmlFor={`exp-${level.toLowerCase().replace(' ', '-')}`}
                          className="ml-3 text-sm text-gray-700"
                        >
                          {level}
                        </label>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Job Listings */}
        <div className="w-full md:w-3/4">
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {loading ? (
                <div className="p-8 text-center">Loading jobs...</div>
              ) : error ? (
                <div className="p-8 text-center text-red-500">{error}</div>
              ) : jobs && jobs.length > 0 ? (
                jobs.map((job) => (
                  <li key={job.id}>
                    <Link
                      to={`/jobs/${job.id}`}
                      className="block hover:bg-gray-50"
                    >
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-blue-600 truncate">
                            {job.title}
                          </p>
                          <div className="ml-2 flex-shrink-0 flex">
                            <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              {job.jobType}
                            </p>
                          </div>
                        </div>
                        <div className="mt-2 sm:flex sm:justify-between">
                          <div className="sm:flex">
                            <p className="flex items-center text-sm text-gray-500">
                              {job.company}
                            </p>
                            <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
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
                            </p>
                          </div>
                          <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                            <p>
                              Posted{' '}
                              <time dateTime={job.postedAt}>
                                {new Date(job.postedAt).toLocaleDateString()}
                              </time>
                            </p>
                          </div>
                        </div>
                        <div className="mt-2">
                          {job.skills?.slice(0, 3).map((skill) => (
                            <span
                              key={skill}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2"
                            >
                              {skill}
                            </span>
                          ))}
                          {job.skills?.length > 3 && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              +{job.skills.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  </li>
                ))
              ) : (
                <div className="p-8 text-center text-gray-500">
                  No jobs found. Try adjusting your search or filters.
                </div>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobListingsPage;