const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const MedicineReminder = sequelize.define('MedicineReminder', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    medicineName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    dosage: {
        type: DataTypes.STRING,
        allowNull: true
    },
    frequency: {
        type: DataTypes.STRING, // e.g., "Daily", "Weekly", "2 times a day"
        allowNull: false
    },
    scheduledTimes: {
        type: DataTypes.JSON, // Array of time strings e.g., ["08:00", "20:00"]
        allowNull: false
    },
    startDate: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    endDate: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    instructions: {
        type: DataTypes.TEXT, // e.g., "After food"
        allowNull: true
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
});

module.exports = MedicineReminder;
