import { supabase } from '../../../config/supabaseClient';

const getDashboardStats = async () => {
  try {
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

    return {
      totalUsers: totalUsers || 0,
      totalJobs: totalJobs || 0,
      totalEmployers: totalEmployers || 0,
      totalJobSeekers: totalJobSeekers || 0,
      pendingApprovals: pendingApprovals || 0,
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};

const getRecentUsers = async () => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, email, role, created_at')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;

    return data.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.created_at
    }));
  } catch (error) {
    console.error('Error fetching recent users:', error);
    throw error;
  }
};

const getRecentJobs = async () => {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .select('*, employer:profiles!employer_id(id, name, email)')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;

    return data.map(job => ({
      id: job.id,
      title: job.title,
      status: job.status,
      createdAt: job.created_at,
      employer: job.employer
    }));
  } catch (error) {
    console.error('Error fetching recent jobs:', error);
    throw error;
  }
};

const getAllUsers = async () => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, email, role, created_at, is_active')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.created_at,
      isActive: user.is_active
    }));
  } catch (error) {
    console.error('Error fetching all users:', error);
    throw error;
  }
};

const getAllJobs = async () => {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .select('*, employer:profiles!employer_id(id, name, email)')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(job => ({
      id: job.id,
      title: job.title,
      status: job.status,
      createdAt: job.created_at,
      employer: job.employer
    }));
  } catch (error) {
    console.error('Error fetching all jobs:', error);
    throw error;
  }
};

const getPendingApprovals = async () => {
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

    return {
      pendingJobs: formattedJobs,
      pendingUsers: formattedUsers,
      total: formattedJobs.length + formattedUsers.length,
    };
  } catch (error) {
    console.error('Error fetching pending approvals:', error);
    throw error;
  }
};

const createUser = async (userData) => {
  // Admin creating a user requires service role or calling a backend function
  // For security, client-side admin creation is limited.
  // We can use supabase.auth.signUp but that logs the current user out.
  // Ideally this should still go through a backend function or Edge Function.
  // For now, we'll throw an error or implement a workaround if possible.
  throw new Error('Creating users via admin panel requires backend implementation.');
};

const updateUser = async (userId, userData) => {
  try {
    const updates = {};
    if (userData.name) updates.name = userData.name;
    if (userData.role) updates.role = userData.role;
    if (userData.isActive !== undefined) updates.is_active = userData.isActive;

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      role: data.role,
      isActive: data.is_active
    };
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

const adminService = {
  getDashboardStats,
  getRecentUsers,
  getRecentJobs,
  getAllUsers,
  getAllJobs,
  getPendingApprovals,
  createUser,
  updateUser,
};

export default adminService;