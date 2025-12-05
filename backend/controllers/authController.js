const { supabase, supabaseAuth } = require('../config/supabaseClient');
const { AppError, UnauthorizedError } = require('../middleware/errorHandler');

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const allowedRoles = ['job_seeker', 'employer', 'admin'];
    if (role && !allowedRoles.includes(role)) {
      throw new AppError('Invalid role specified', 400);
    }

    // Register user with Supabase Auth
    // Metadata will be used by the database trigger to create the profile
    const { data, error } = await supabaseAuth.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role: role || 'job_seeker',
        },
      },
    });

    if (error) {
      throw new AppError(error.message, 400);
    }

    if (!data.user) {
      throw new AppError('Registration failed', 500);
    }

    // If email confirmation is enabled in Supabase, user might not be active yet
    // But for this migration we assume it might be optional or handled

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email for verification if required.',
      user: {
        id: data.user.id,
        email: data.user.email,
        name,
        role: role || 'job_seeker',
      },
      session: data.session,
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError('Please provide email and password', 400);
    }

    const { data, error } = await supabaseAuth.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new UnauthorizedError(error.message);
    }

    // Fetch user profile to get role and name
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      // Fallback if profile doesn't exist (shouldn't happen with triggers)
      console.error('Profile fetch error:', profileError);
    }

    // Update last login
    await supabase
      .from('profiles')
      .update({ last_login: new Date().toISOString() })
      .eq('id', data.user.id);

    res.status(200).json({
      success: true,
      token: data.session.access_token, // Keep 'token' key for frontend compatibility if needed, but prefer session
      session: data.session,
      user: {
        id: data.user.id,
        email: data.user.email,
        ...profile,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    // req.user is already populated by auth middleware
    const user = req.user;

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateDetails = async (req, res, next) => {
  try {
    const { name, email } = req.body;
    const userId = req.user.id;

    // Update profile data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .update({ name, email }) // Note: Changing email in profiles doesn't change auth email
      .eq('id', userId)
      .select()
      .single();

    if (profileError) {
      throw new AppError(profileError.message, 400);
    }

    // If email is being updated, we should also update Supabase Auth email
    // This usually triggers a confirmation email to the new address
    if (email && email !== req.user.email) {
      const { error: authError } = await supabaseAuth.auth.updateUser({ email });
      if (authError) {
        throw new AppError(`Failed to update auth email: ${authError.message}`, 400);
      }
    }

    res.status(200).json({
      success: true,
      data: profile,
      message: email && email !== req.user.email ? 'Profile updated. Please check your new email for verification.' : 'Profile updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

exports.updatePassword = async (req, res, next) => {
  try {
    const { newPassword } = req.body; // Supabase doesn't require current password for update if user is logged in

    if (!newPassword) {
      throw new AppError('Please provide new password', 400);
    }

    const { error } = await supabaseAuth.auth.updateUser({
      password: newPassword
    });

    if (error) {
      throw new AppError(error.message, 400);
    }

    res.status(200).json({
      success: true,
      message: 'Password updated successfully',
    });
  } catch (error) {
    next(error);
  }
};
