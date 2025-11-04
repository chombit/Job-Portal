const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Application = sequelize.define('Application', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    coverLetter: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    resumeUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('pending', 'reviewed', 'interview', 'rejected', 'accepted'),
      defaultValue: 'pending',
    },
    additionalInfo: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
    },
  }, {
    tableName: 'applications',
    timestamps: true,
    underscored: true,
  });

  // Associations
  Application.associate = (models) => {
    Application.belongsTo(models.User, {
      foreignKey: 'applicantId',
      as: 'applicant',
    });
    
    Application.belongsTo(models.Job, {
      foreignKey: 'jobId',
      as: 'job',
    });
  };

  return Application;
};
