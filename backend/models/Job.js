const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Job = sequelize.define('Job', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    jobType: {
      type: DataTypes.ENUM('full-time', 'part-time', 'contract', 'temporary', 'internship'),
      allowNull: false,
    },
    salaryRange: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: { min: null, max: null, currency: 'USD', period: 'year' },
    },
    skills: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    experienceLevel: {
      type: DataTypes.ENUM('entry', 'mid', 'senior', 'lead', 'executive'),
      allowNull: true,
    },
    isRemote: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    status: {
      type: DataTypes.ENUM('draft', 'published', 'archived', 'closed'),
      defaultValue: 'draft',
    },
    applicationDeadline: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    tableName: 'jobs',
    timestamps: true,
    underscored: true,
  });

  // Associations
  Job.associate = (models) => {
    Job.belongsTo(models.User, {
      foreignKey: 'employerId',
      as: 'employer',
    });
    
    Job.hasMany(models.Application, {
      foreignKey: 'jobId',
      as: 'applications',
    });
    
    Job.belongsToMany(models.User, {
      through: 'SavedJobs',
      as: 'savedByUsers',
      foreignKey: 'jobId',
    });
  };

  return Job;
};
