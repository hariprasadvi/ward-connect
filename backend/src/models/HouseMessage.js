const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const HouseMessage = sequelize.define('HouseMessage', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  houseNumber: {
    type: DataTypes.STRING,
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('pickup-alert', 'maintenance', 'general'),
    defaultValue: 'general'
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  timestamps: true,
  tableName: 'HouseMessages'
});

module.exports = HouseMessage;
