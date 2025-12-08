import { supabase } from '../../config/supabaseClient';

// Helper to transform frontend data to DB format
const toDbFormat = (jobData) => {
  const {
    title,
    description,
    location,
    jobType,
    experienceLevel,
    isRemote,
    status,
    applicationDeadline,
    salaryMin,
    salaryMax,
    salaryCurrency,
    salaryPeriod,
    skills,
    // Extract any other fields if necessary
  } = jobData;

  return {
    title,
    description,
    location,
    job_type: jobType,
    experience_level: experienceLevel,
    is_remote: isRemote,
    status: status || 'published',
    application_deadline: applicationDeadline,
    skills,
    salary_range: {
      min: salaryMin,
      max: salaryMax,
      currency: salaryCurrency,
      period: salaryPeriod
    }
  };
};

// Helper to transform DB data to frontend format
const fromDbFormat = (job) => {
  if (!job) return null;
  return {
    ...job,
    jobType: job.job_type,
    experienceLevel: job.experience_level,
    isRemote: job.is_remote,
    applicationDeadline: job.application_deadline,
    salaryRange: job.salary_range,
    // Flatten salary fields for form compatibility
    salaryMin: job.salary_range?.min,
    salaryMax: job.salary_range?.max,
    salaryCurrency: job.salary_range?.currency,
    salaryPeriod: job.salary_range?.period,
    createdAt: job.created_at,
    updatedAt: job.updated_at,
    employer: job.employer // maintain employer relation
  };
};

export default {
  getJobs: async (params = {}) => {
    try {
      let query = supabase
        .from('jobs')
        .select('*, employer:profiles!employer_id(id, name, email)')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      // Apply filters
      if (params.search) {
        query = query.ilike('title', `%${params.search}%`);
      }
      if (params.location) {
        query = query.ilike('location', `%${params.location}%`);
      }
      if (params.type) {
        query = query.eq('job_type', params.type);
      }
      if (params.level) {
        query = query.eq('experience_level', params.level);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data.map(fromDbFormat);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      throw error;
    }
  },

  createJob: async (jobData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const dbData = {
        ...toDbFormat(jobData),
        employer_id: user.id,
      };

      const { data, error } = await supabase
        .from('jobs')
        .insert([dbData])
        .select('*, employer:profiles!employer_id(id, name, email)')
        .single();

      if (error) throw error;
      return fromDbFormat(data);
    } catch (error) {
      console.error('Error creating job:', error);
      throw error;
    }
  },

  getJob: async (jobId) => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*, employer:profiles!employer_id(id, name, email)')
        .eq('id', jobId)
        .single();

      if (error) throw error;
      return fromDbFormat(data);
    } catch (error) {
      console.error('Error fetching job:', error);
      throw error;
    }
  },

  updateJob: async (id, jobData) => {
    try {
      const dbData = toDbFormat(jobData);

      const { data, error } = await supabase
        .from('jobs')
        .update(dbData)
        .eq('id', id)
        .select('*, employer:profiles!employer_id(id, name, email)')
        .single();

      if (error) throw error;
      return fromDbFormat(data);
    } catch (error) {
      console.error(`Error updating job ${id}:`, error);
      throw error;
    }
  },

  deleteJob: async (id) => {
    try {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { message: 'Job deleted successfully' };
    } catch (error) {
      console.error(`Error deleting job ${id}:`, error);
      throw error;
    }
  },

  getFeaturedJobs: async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*, employer:profiles!employer_id(id, name, email)')
        .eq('status', 'published')
        .limit(6)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data.map(fromDbFormat);
    } catch (error) {
      console.error('Error fetching featured jobs:', error);
      throw error;
    }
  },

  getMyJobs: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('employer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data.map(fromDbFormat);
    } catch (error) {
      console.error('Error fetching my jobs:', error);
      throw error;
    }
  },

  applyForJob: async (jobId, applicationData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Upload resume if it's a file
      let resumeUrl = applicationData.resume;
      if (applicationData.resume instanceof File) {
        const fileExt = applicationData.resume.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('resumes')
          .upload(fileName, applicationData.resume);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('resumes')
          .getPublicUrl(fileName);

        resumeUrl = publicUrl;
      } else if (applicationData.has('resume')) {
        // If accessing via FormData in component but passed here as object? 
        // Check how applyForJob is called.
        // JobDetailsPage: dispatch(applyForJob({ jobId: id, applicationData: formData }))
        // jobSlice: api.applyForJob(jobId, applicationData)
        // So applicationData is FormData here if it comes from JobDetailsPage.

        // Wait, if applicationData is FormData, we can't access .resume directly like mapped object.
        // We need to check if it's FormData.
      }

      // Handle FormData or Object
      let cvFile;
      let coverLetter;

      if (applicationData instanceof FormData) {
        cvFile = applicationData.get('resume');
        coverLetter = applicationData.get('coverLetter'); // Check if JobDetailsPage appends this
      } else {
        cvFile = applicationData.resume;
        coverLetter = applicationData.coverLetter;
      }

      // Re-implement upload logic for correctness with FormData
      if (cvFile instanceof File) {
        const fileExt = cvFile.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('resumes')
          .upload(fileName, cvFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('resumes')
          .getPublicUrl(fileName);

        resumeUrl = publicUrl;
      }

      const { data, error } = await supabase
        .from('applications')
        .insert([{
          job_id: jobId,
          applicant_id: user.id,
          cover_letter: coverLetter,
          resume_url: resumeUrl,
          status: 'pending'
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error applying for job:', error);
      throw error;
    }
  },
};
