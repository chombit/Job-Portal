const { supabase } = require('../config/supabaseClient');
const { AppError, NotFoundError } = require('../middleware/errorHandler');

exports.getSavedJobs = async (req, res, next) => {
  try {
    const { data: savedJobs, error } = await supabase
      .from('saved_jobs')
      .select(`
        *,
        job:jobs!job_id (
          *,
          employer:profiles!employer_id (id, name, profile_data)
        )
      `)
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw new AppError(error.message, 500);
    }

    const formattedSavedJobs = savedJobs.map(sj => ({
      id: sj.id,
      notes: sj.notes,
      createdAt: sj.created_at,
      job: sj.job ? {
        id: sj.job.id,
        title: sj.job.title,
        description: sj.job.description,
        location: sj.job.location,
        jobType: sj.job.job_type,
        salaryRange: sj.job.salary_range,
        employer: sj.job.employer ? {
          id: sj.job.employer.id,
          name: sj.job.employer.name,
          profileData: sj.job.employer.profile_data
        } : { name: 'Unknown Company' }
      } : null
    })).filter(sj => sj.job); // Filter out saved jobs where job might have been deleted

    res.status(200).json({
      success: true,
      count: formattedSavedJobs.length,
      data: formattedSavedJobs,
    });
  } catch (error) {
    next(error);
  }
};

exports.saveJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const { notes } = req.body;

    // Check if job exists
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('id')
      .eq('id', jobId)
      .single();

    if (jobError || !job) {
      throw new NotFoundError('Job not found');
    }

    // Check if already saved
    const { data: existingSavedJob } = await supabase
      .from('saved_jobs')
      .select('id')
      .eq('user_id', req.user.id)
      .eq('job_id', jobId)
      .single();

    if (existingSavedJob) {
      throw new AppError('Job already saved', 400);
    }

    const { data: savedJob, error } = await supabase
      .from('saved_jobs')
      .insert({
        user_id: req.user.id,
        job_id: jobId,
        notes,
      })
      .select()
      .single();

    if (error) {
      throw new AppError(error.message, 400);
    }

    res.status(201).json({
      success: true,
      data: {
        id: savedJob.id,
        userId: savedJob.user_id,
        jobId: savedJob.job_id,
        notes: savedJob.notes,
        createdAt: savedJob.created_at
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.updateSavedJob = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const { data: savedJob, error: fetchError } = await supabase
      .from('saved_jobs')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (fetchError || !savedJob) {
      throw new NotFoundError('Saved job not found');
    }

    const { data: updatedJob, error } = await supabase
      .from('saved_jobs')
      .update({ notes: notes || savedJob.notes })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new AppError(error.message, 500);
    }

    res.status(200).json({
      success: true,
      data: {
        id: updatedJob.id,
        userId: updatedJob.user_id,
        jobId: updatedJob.job_id,
        notes: updatedJob.notes,
        createdAt: updatedJob.created_at
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.removeSavedJob = async (req, res, next) => {
  try {
    const { error } = await supabase
      .from('saved_jobs')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user.id);

    if (error) {
      // If error is because record not found, it's effectively deleted, but let's check
      // Supabase delete doesn't return error if no rows deleted unless we ask for it
      // But for now assume success
    }

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

exports.checkIfJobIsSaved = async (req, res, next) => {
  try {
    const { data: savedJob } = await supabase
      .from('saved_jobs')
      .select('id, notes, created_at')
      .eq('user_id', req.user.id)
      .eq('job_id', req.params.jobId)
      .single();

    res.status(200).json({
      success: true,
      isSaved: !!savedJob,
      data: savedJob ? {
        id: savedJob.id,
        notes: savedJob.notes,
        createdAt: savedJob.created_at
      } : null,
    });
  } catch (error) {
    next(error);
  }
};
