const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const InsuranceScheme = sequelize.define('InsuranceScheme', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    coverAmount: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    minAge: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    maxAge: {
        type: DataTypes.INTEGER,
        defaultValue: 150
    },
    incomeLimit: {
        type: DataTypes.INTEGER,
        allowNull: true // null means no limit
    },
    stateRestriction: {
        type: DataTypes.STRING,
        allowNull: true // e.g. "Kerala" or null for All
    },
    employmentRestriction: {
        type: DataTypes.STRING,
        allowNull: true // e.g. "Government" or null for All
    }
}, {
    timestamps: true
});

module.exports = InsuranceScheme;
