const { supabaseAuth, supabase } = require('../config/supabaseClient');

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authorized to access this route' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `User role ${req.user.role} is not authorized to access this route`
      });
    }

    next();
  };
};

const auth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token, authorization denied' });
    }

    const token = authHeader.split(' ')[1];

    try {
      // Verify token with Supabase
      const { data: { user }, error } = await supabaseAuth.auth.getUser(token);

      if (error || !user) {
        throw new Error('Invalid token');
      }

      // Fetch user profile from our custom table to get the role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError || !profile) {
        // Fallback if profile missing (shouldn't happen)
        console.error('Profile missing for user:', user.id);
        return res.status(401).json({ error: 'User profile not found' });
      }

      if (profile.is_active === false) {
        return res.status(401).json({ error: 'User account is inactive' });
      }

      // Attach user to request
      req.user = {
        id: user.id,
        email: user.email,
        role: profile.role,
        ...profile
      };

      next();
    } catch (error) {
      console.error('Token verification error:', error.message);
      return res.status(401).json({
        error: 'Token is not valid',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    res.status(500).json({
      error: 'Server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = { auth, authorize };