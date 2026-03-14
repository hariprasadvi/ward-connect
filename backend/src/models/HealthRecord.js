const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const HealthRecord = sequelize.define('HealthRecord', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING, // e.g., "Full Body Checkup"
        allowNull: false
    },
    recordDate: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    doctorName: {
        type: DataTypes.STRING,
        allowNull: true
    },
    hospitalName: {
        type: DataTypes.STRING,
        allowNull: true
    },
    category: {
        type: DataTypes.STRING, // e.g., "Lab Report", "Prescription", "Vaccination"
        allowNull: true
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    fileUrl: {
        type: DataTypes.STRING, // URL to stored file/image
        allowNull: true
    }
});

module.exports = HealthRecord;
