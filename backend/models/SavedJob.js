const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SavedJob = sequelize.define('SavedJob', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'user_id',
    },
    jobId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'job_id',
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    tableName: 'saved_jobs',
    timestamps: true,
    underscored: true,
  });

  SavedJob.associate = (models) => {
    SavedJob.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
    });

    SavedJob.belongsTo(models.Job, {
      foreignKey: 'jobId',
      as: 'job',
    });
  };

  return SavedJob;
};
