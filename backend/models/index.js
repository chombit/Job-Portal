require('dotenv').config();
const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');

const basename = path.basename(__filename);

let sequelize;

// Configure database connection based on environment
const getSequelizeConfig = () => {
  if (process.env.NODE_ENV === 'production') {
    return {
      database: process.env.DATABASE_URL,
      options: {
        dialect: 'postgres',
        dialectOptions: {
          ssl: { 
            require: true, 
            rejectUnauthorized: false 
          }
        },
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
      }
    };
  }

  return {
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    options: {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      dialect: 'postgres',
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      },
      define: {
        timestamps: true,
        underscored: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
      }
    }
  };
};

const { database, username, password, options } = getSequelizeConfig();

// Initialize Sequelize
sequelize = username 
  ? new Sequelize(database, username, password, options)
  : new Sequelize(database, options);

// Test the database connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection has been established successfully.');
    return true;
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    return false;
  }
};

// Import all models from files in this directory
const db = {};

fs.readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      !file.includes('.test.js')
    );
  })
  .forEach(file => {
    try {
      const model = require(path.join(__dirname, file))(sequelize);
      db[model.name] = model;
    } catch (error) {
      console.error(`Error loading model ${file}:`, error);
    }
  });

// Set up model associations
Object.keys(db).forEach(modelName => {
  try {
    if (db[modelName].associate) {
      db[modelName].associate(db);
    }
  } catch (error) {
    console.error(`Error setting up associations for ${modelName}:`, error);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;
db.testConnection = testConnection;

module.exports = db;
