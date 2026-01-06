const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const WasteComplaint = sequelize.define('WasteComplaint', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  userName: {
    type: DataTypes.STRING
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  category: {
    type: DataTypes.ENUM('missed-pickup', 'improper-collection', 'littering', 'illegal-dumping', 'other'),
    defaultValue: 'other'
  },
  location: {
    type: DataTypes.STRING
  },
  photoUrl: {
    type: DataTypes.TEXT
  },
  status: {
    type: DataTypes.ENUM('pending', 'assigned', 'in-progress', 'resolved', 'closed'),
    defaultValue: 'pending'
  },
  assignedStaff: {
    type: DataTypes.STRING
  },
  adminResponse: {
    type: DataTypes.TEXT
  },
  resolvedAt: {
    type: DataTypes.DATE
  }
}, {
  timestamps: true,
  tableName: 'WasteComplaints'
});

module.exports = WasteComplaint;
