// Core dependencies
const path = require('path');

// Load environment variables first
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Debug log environment variables (without sensitive data)
console.log('Environment Variables Loaded:', {
  NODE_ENV: process.env.NODE_ENV,
  DB_NAME: process.env.DB_NAME ? '***' : 'Not set',
  DB_USER: process.env.DB_USER ? '***' : 'Not set',
  DB_HOST: process.env.DB_HOST ? '***' : 'Not set',
  DB_PORT: process.env.DB_PORT ? '***' : 'Not set',
  JWT_SECRET: process.env.JWT_SECRET ? '***' : 'Not set',
  JWT_EXPIRE: process.env.JWT_EXPIRE || '30d',
  NODE_ENV: process.env.NODE_ENV || 'development'
});

// Third-party dependencies
const express = require('express');
const cors = require('cors');

// Local dependencies
const { sequelize } = require('./models');
const { errorHandler } = require('./middleware/errorHandler');
const apiRoutes = require('./routes/api');

// Initialize express app
const app = express();

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

const corsOptions = {
  origin: ['http://localhost:5173', 'https://job-portal-beige-ten.vercel.app','https://job-portal-1-i70z.onrender.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', apiRoutes);

app.use(express.static(path.join(__dirname, 'public')));

app.use(errorHandler);

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

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    console.log('🔌 Attempting to connect to the database...');
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully');
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 Syncing database...');
      await sequelize.sync({ alter: true });
      console.log('🔄 Database synchronized');
    }
    
    if (process.env.NODE_ENV !== 'test') {
      const server = app.listen(PORT, '0.0.0.0', () => {
        const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
        const host = process.env.NODE_ENV === 'production' 
          ? 'job-portal-1-i70z.onrender.com' 
          : `localhost:${PORT}`;
        
        const baseUrl = `${protocol}://${host}/api`;
        
        console.log(`\n🚀 Server started successfully!`);
        console.log(`   - Port: ${PORT}`);
        console.log(`   - Environment: ${process.env.NODE_ENV}`);
        console.log(`   - Database: ${process.env.DB_NAME}@${process.env.DB_HOST}:${process.env.DB_PORT}`);
        console.log(`   - API: ${baseUrl}\n`);
      });

      // Handle server errors
      server.on('error', (error) => {
        if (error.code === 'EADDRINUSE') {
          console.error(`❌ Port ${PORT} is already in use`);
          process.exit(1);
        } else {
          console.error('❌ Server error:', error);
          process.exit(1);
        }
      });

      // Handle unhandled promise rejections
      process.on('unhandledRejection', (err) => {
        console.error('\n❌ UNHANDLED REJECTION! Shutting down...');
        console.error(err.name, err.message);
        server.close(() => {
          console.log('💥 Process terminated!');
          process.exit(1);
        });
      });

      // Handle graceful shutdown
      process.on('SIGTERM', () => {
        console.log('\n👋 SIGTERM RECEIVED. Shutting down gracefully');
        server.close(() => {
          console.log('💥 Process terminated!');
          process.exit(0);
        });
      });
    }
  } catch (error) {
    console.error('\n❌ Failed to start server:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    
    if (error.name === 'SequelizeConnectionError') {
      console.error('\nDatabase connection failed. Please check:');
      console.error(`- Is the database server running at ${process.env.DB_HOST}:${process.env.DB_PORT}?`);
      console.error('- Are the database credentials in .env correct?');
      console.error('- Does the database user have proper permissions?');
    }
    
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
