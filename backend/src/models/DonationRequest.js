const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const DonationRequest = sequelize.define('DonationRequest', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    patientName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    bloodGroup: {
        type: DataTypes.ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'),
        allowNull: false
    },
    hospitalLocation: {
        type: DataTypes.STRING,
        allowNull: false
    },
    urgencyLevel: {
        type: DataTypes.ENUM('Low', 'Medium', 'Critical'),
        defaultValue: 'Medium'
    },
    contactNumber: {
        type: DataTypes.STRING,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('Pending', 'Fulfilled', 'Cancelled'),
        defaultValue: 'Pending'
    },
    requiredDate: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    requiredUnits: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
    },
    fulfilledUnits: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    }
});

module.exports = DonationRequest;
