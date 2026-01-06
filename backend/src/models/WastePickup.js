const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const WastePickup = sequelize.define('WastePickup', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true, // Can be null if admin schedules for generic/multiple
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  userName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  type: {
    type: DataTypes.ENUM('regular', 'bulk'),
    defaultValue: 'regular'
  },
  scheduledDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  scheduledTime: {
    type: DataTypes.STRING, // e.g., '10:00 AM'
    allowNull: false
  },
  address: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'in-progress', 'completed', 'cancelled'),
    defaultValue: 'pending'
  },
  wasteType: {
    type: DataTypes.STRING
  },
  quantity: {
    type: DataTypes.STRING
  },
  description: {
    type: DataTypes.TEXT
  },
  assignedVehicle: {
    type: DataTypes.STRING
  },
  houseNumbers: {
    type: DataTypes.JSONB, // Using JSONB for Postgres containment operator support
    defaultValue: []
  },
  isAdminScheduled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isUserAcknowledged: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  timestamps: true,
  tableName: 'WastePickups'
});

module.exports = WastePickup;
