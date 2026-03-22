const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');
const KudumbashreeGroup = require('./KudumbashreeGroup');

const KudumbashreeProfile = sequelize.define('KudumbashreeProfile', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id',
        },
    },
    groupId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: KudumbashreeGroup,
            key: 'id',
        },
    },
    memberId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    bank_account: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    ifsc_code: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    join_date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
}, {
    timestamps: true,
});

// Associations are handled in src/models/associations.js

module.exports = KudumbashreeProfile;
