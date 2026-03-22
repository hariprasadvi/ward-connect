const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const KudumbashreeGroup = require('./KudumbashreeGroup');

const Meeting = sequelize.define('Meeting', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    groupId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: KudumbashreeGroup,
            key: 'id',
        },
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    location: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    latitude: {
        type: DataTypes.DECIMAL(10, 8),
        allowNull: true,
    },
    longitude: {
        type: DataTypes.DECIMAL(11, 8),
        allowNull: true,
    },
    radius: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 100, // meters
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    processingStatus: {
        type: DataTypes.ENUM('PENDING', 'UPLOADING', 'PROCESSING', 'COMPLETED', 'FAILED'),
        allowNull: false,
        defaultValue: 'PENDING'
    },
    audioData: {
        type: DataTypes.BLOB, // Plain BLOB for Postgres (BYTEA)
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('Scheduled', 'Completed', 'Cancelled'),
        allowNull: false,
        defaultValue: 'Scheduled',
    },
    audio_url: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    transcript: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    summary: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
}, {
    timestamps: true,
});

// Associations handled in src/models/associations.js

module.exports = Meeting;
