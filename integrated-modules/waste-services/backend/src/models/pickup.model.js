const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Pickup = sequelize.define('Pickup', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true // Can be null if admin schedules for generic/multiple
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
    allowNull: false
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
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  isAdminScheduled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
});

module.exports = Pickup;
