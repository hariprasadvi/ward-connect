const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const OpBooking = sequelize.define('OpBooking', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    hospital: {
        type: DataTypes.STRING,
        allowNull: false
    },
    department: {
        type: DataTypes.STRING,
        allowNull: false
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    timeSlot: {
        type: DataTypes.STRING,
        allowNull: false
    },
    patientDetails: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('Pending', 'Approved', 'Rejected'),
        defaultValue: 'Pending'
    },
    tokenNumber: {
        type: DataTypes.STRING,
        allowNull: true
    },
    rejectionReason: {
        type: DataTypes.STRING,
        allowNull: true
    },
    healthWorkerId: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
});

module.exports = OpBooking;
