const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CommunityStat = sequelize.define('CommunityStat', {
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        primaryKey: true // Enforce one record per day
    },
    cases: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    active: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    alerts: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    alertMessage: {
        type: DataTypes.STRING,
        allowNull: true
    },
    immunity: {
        type: DataTypes.INTEGER,
        defaultValue: 0 // percentage 0-100
    }
}, {
    timestamps: true
});

module.exports = CommunityStat;
