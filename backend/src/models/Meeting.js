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
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
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

Meeting.belongsTo(KudumbashreeGroup, { foreignKey: 'groupId' });

module.exports = Meeting;
