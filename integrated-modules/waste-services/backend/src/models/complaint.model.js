const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Complaint = sequelize.define('Complaint', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
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
    type: DataTypes.STRING
  },
  status: {
    type: DataTypes.ENUM('pending', 'assigned', 'in-progress', 'resolved', 'closed'),
    defaultValue: 'pending'
  },
  assignedStaff: {
    type: DataTypes.STRING
  },
  resolvedAt: {
    type: DataTypes.DATE
  }
});

module.exports = Complaint;
