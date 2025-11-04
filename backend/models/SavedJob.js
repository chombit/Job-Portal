const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SavedJob = sequelize.define('SavedJob', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
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

  // No need for associations here as they're defined in User and Job models
  
  return SavedJob;
};
