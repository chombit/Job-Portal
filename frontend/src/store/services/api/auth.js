import { supabase } from '../../../config/supabaseClient';

const register = async (userData) => {
  const { email, password, name, role, company } = userData;

  // 1. Sign up with Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        role,
        company: role === 'employer' ? company : null
      }
    }
  });

  if (authError) throw authError;

  return {
    user: {
      id: authData.user?.id,
      email: authData.user?.email,
      name,
      role,
      ...authData.user?.user_metadata
    },
    token: authData.session?.access_token
  };
};

const login = async (credentials) => {
  const { email, password } = credentials;

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      if (error.message.includes('Email not confirmed')) {
        throw new Error('Please check your email and click the confirmation link before logging in.');
      }
      throw error;
    }

    // Fetch profile to get role and name
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      return {
        user: {
          id: data.user.id,
          email: data.user.email,
          ...data.user.user_metadata
        },
        token: data.session.access_token
      };
    }

    return {
      user: {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        role: profile.role,
        profileData: profile.profile_data,
        isActive: profile.is_active
      },
      token: data.session.access_token
    };
  } catch (error) {
    throw error;
  }
};

const getMe = async () => {
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError) throw authError;
  if (!user) throw new Error('No user logged in');

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profileError) throw profileError;

  return {
    id: profile.id,
    email: profile.email,
    name: profile.name,
    role: profile.role,
    profileData: profile.profile_data,
    isActive: profile.is_active
  };
};

const authService = {
  register,
  login,
  getMe,
};

export default authService;