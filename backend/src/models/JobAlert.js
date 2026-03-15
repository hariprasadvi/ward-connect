const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const JobAlert = sequelize.define('JobAlert', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    company: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    location: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    type: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    sourceUrl: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true // Prevents duplicate scraping of the same job posting
    },
    postedAt: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    timestamps: true,
});

module.exports = JobAlert;
