const { supabase, supabaseAuth } = require('../config/supabaseClient');
const { AppError, NotFoundError } = require('../middleware/errorHandler');

exports.getDashboardStats = async (req, res, next) => {
  try {
    // Use Promise.all for parallel queries
    const [
      { count: totalUsers },
      { count: totalJobs },
      { count: totalEmployers },
      { count: totalJobSeekers },
      { count: pendingApprovals }
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('jobs').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'employer'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'job_seeker'),
      supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('status', 'draft')
    ]);

    res.status(200).json({
      totalUsers: totalUsers || 0,
      totalJobs: totalJobs || 0,
      totalEmployers: totalEmployers || 0,
      totalJobSeekers: totalJobSeekers || 0,
      pendingApprovals: pendingApprovals || 0,
    });
  } catch (error) {
    console.error('Error in getDashboardStats:', error);
    next(error);
  }
};

exports.getRecentUsers = async (req, res, next) => {
  try {
    const { data: users, error } = await supabase
      .from('profiles')
      .select('id, name, email, role, created_at')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;

    // Map snake_case to camelCase
    const formattedUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.created_at
    }));

    res.status(200).json(formattedUsers);
  } catch (error) {
    console.error('Error in getRecentUsers:', error);
    next(error);
  }
};

exports.getAllUsers = async (req, res, next) => {
  try {
    const { data: users, error } = await supabase
      .from('profiles')
      .select('id, name, email, role, created_at, is_active')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const formattedUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.created_at,
      isActive: user.is_active
    }));

    res.status(200).json(formattedUsers);
  } catch (error) {
    next(error);
  }
};

exports.getRecentJobs = async (req, res, next) => {
  try {
    const { data: jobs, error } = await supabase
      .from('jobs')
      .select('*, employer:profiles!employer_id(id, name, email)')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;

    const formattedJobs = jobs.map(job => ({
      id: job.id,
      title: job.title,
      status: job.status,
      createdAt: job.created_at,
      employer: job.employer
    }));

    res.status(200).json(formattedJobs);
  } catch (error) {
    next(error);
  }
};

exports.getAllJobs = async (req, res, next) => {
  try {
    const { data: jobs, error } = await supabase
      .from('jobs')
      .select('*, employer:profiles!employer_id(id, name, email)')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const formattedJobs = jobs.map(job => ({
      id: job.id,
      title: job.title,
      status: job.status,
      createdAt: job.created_at,
      employer: job.employer
    }));

    res.status(200).json(formattedJobs);
  } catch (error) {
    next(error);
  }
};

exports.getPendingApprovals = async (req, res, next) => {
  try {
    const { data: pendingJobs, error: jobsError } = await supabase
      .from('jobs')
      .select('*, employer:profiles!employer_id(id, name, email)')
      .eq('status', 'draft')
      .order('created_at', { ascending: false });

    if (jobsError) throw jobsError;

    const { data: pendingUsers, error: usersError } = await supabase
      .from('profiles')
      .select('*')
      .eq('is_active', false)
      .order('created_at', { ascending: false });

    if (usersError) throw usersError;

    const formattedJobs = pendingJobs.map(job => ({
      id: job.id,
      title: job.title,
      status: job.status,
      createdAt: job.created_at,
      employer: job.employer
    }));

    const formattedUsers = pendingUsers.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.created_at,
      isActive: user.is_active
    }));

    res.status(200).json({
      pendingJobs: formattedJobs,
      pendingUsers: formattedUsers,
      total: formattedJobs.length + formattedUsers.length,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateJobStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const { data: job, error } = await supabase
      .from('jobs')
      .update({ status })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) {
      throw new NotFoundError('Job not found');
    }

    res.status(200).json(job);
  } catch (error) {
    next(error);
  }
};

exports.updateUserStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;

    // Update profile status
    const { data: user, error } = await supabase
      .from('profiles')
      .update({ is_active: isActive })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) {
      throw new NotFoundError('User not found');
    }

    // Also update auth user status if possible (requires service role)
    // Supabase Auth doesn't have a direct 'isActive' flag exposed easily via JS client 
    // without using admin.updateUser ban duration or similar.
    // For now, we rely on our middleware checking the profile's is_active status.

    res.status(200).json({
      id: user.id,
      isActive: user.is_active
    });
  } catch (error) {
    next(error);
  }
};

exports.createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, company } = req.body;

    // Create user using Supabase Admin API (bypasses email confirmation if needed)
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm admin created users
      user_metadata: {
        name,
        role,
        company: role === 'employer' ? company : null
      }
    });

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    // Profile should be created automatically by trigger, but we can update it to be sure
    // or set specific fields like is_active = true (default is true anyway)

    res.status(201).json({
      success: true,
      data: {
        id: data.user.id,
        email: data.user.email,
        name,
        role,
        isActive: true
      }
    });
  } catch (error) {
    console.error('Error in createUser:', error);
    next(error);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, role, isActive } = req.body;

    const updates = {};
    if (name) updates.name = name;
    if (email) updates.email = email;
    if (role) updates.role = role;
    if (isActive !== undefined) updates.is_active = isActive;

    const { data: user, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new NotFoundError('User not found');
    }

    // If email changed, update auth email too
    if (email) {
      await supabase.auth.admin.updateUserById(id, { email });
    }

    res.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.is_active
    });
  } catch (error) {
    next(error);
  }
};