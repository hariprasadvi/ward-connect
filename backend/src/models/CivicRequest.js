const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CivicRequest = sequelize.define('CivicRequest', {
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
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    location: {
        type: DataTypes.STRING,
        allowNull: false
    },
    mediaUrl: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('Pending', 'Assigned', 'In-Progress', 'Resolved', 'Closed'),
        defaultValue: 'Pending'
    },
    adminResponse: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    timestamps: true,
    tableName: 'CivicRequests'
});

module.exports = CivicRequest;
