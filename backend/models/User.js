const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('admin', 'employer', 'job_seeker'),
      allowNull: false,
      defaultValue: 'job_seeker',
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    profileData: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    lastLogin: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    tableName: 'users',
    timestamps: true,
    underscored: true,
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
    },
  });

  // Instance method to check password
  User.prototype.validPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
  };

  // Associations
  User.associate = (models) => {
    User.hasMany(models.Job, {
      foreignKey: 'employerId',
      as: 'postedJobs',
    });
    
    User.hasMany(models.Application, {
      foreignKey: 'applicantId',
      as: 'applications',
    });
    
    User.belongsToMany(models.Job, {
      through: 'SavedJobs',
      as: 'savedJobs',
      foreignKey: 'userId',
    });
  };

  return User;
};
