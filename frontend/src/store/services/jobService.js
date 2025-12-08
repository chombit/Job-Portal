import { supabase } from '../../config/supabaseClient';

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
      return data;
    } catch (error) {
      console.error('Error fetching jobs:', error);
      throw error;
    }
  },

  createJob: async (jobData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('jobs')
        .insert([{
          ...jobData,
          employer_id: user.id,
          status: 'published' // Default to published for now
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
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
      return data;
    } catch (error) {
      console.error('Error fetching job:', error);
      throw error;
    }
  },

  updateJob: async (id, jobData) => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .update(jobData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
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
      return data;
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
      return data;
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
      }

      const { data, error } = await supabase
        .from('applications')
        .insert([{
          job_id: jobId,
          applicant_id: user.id,
          cover_letter: applicationData.coverLetter,
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
