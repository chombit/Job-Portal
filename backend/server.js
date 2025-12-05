require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { errorHandler } = require('./middleware/errorHandler');
const apiRoutes = require('./routes/api');

const app = express();

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

const corsOptions = {
  origin: [
    'http://localhost:5173',
    'https://job-portal-beige-ten.vercel.app',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', apiRoutes);

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

app.all('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Can't find ${req.originalUrl} on this server!`,
  });
});

// Centralized error handler (last middleware)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const { supabase } = require('./config/supabaseClient');

const startServer = async () => {
  try {
    // Check Supabase connection
    const { data, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });

    if (error) {
      console.error('❌ Unable to connect to Supabase:', error.message);
      // Don't exit, just log error, as server might still serve static files or handle other things
    } else {
      console.log('✅ Supabase connection established successfully.');
    }

    if (process.env.NODE_ENV !== 'test') {
      const server = app.listen(PORT, () => {
        const baseUrl = process.env.NODE_ENV === 'production'
          ? 'https://job-portal-dexz.onrender.com/api'
          : `http://localhost:${PORT}/api`;

        console.log(`Server running on port ${PORT}`);
        console.log(`🌐 API Base URL: ${baseUrl}`);
        console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      }).on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          console.log(`Port ${PORT} is in use, trying port ${Number(PORT) + 1}...`);
          app.listen(Number(PORT) + 1);
        } else {
          console.error('Server error:', err);
          process.exit(1);
        }
      });

      process.on('unhandledRejection', (err) => {
        console.error('UNHANDLED REJECTION! 💥 Shutting down...');
        console.error(err);
        server.close(() => {
          process.exit(1);
        });
      });
    }
  } catch (error) {
    console.error('❌ Server startup error:', error);
    process.exit(1);
  }
};

startServer();

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => {
    console.log('💥 Process terminated!');
  });
});

module.exports = app; 
