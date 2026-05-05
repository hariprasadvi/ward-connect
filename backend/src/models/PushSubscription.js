const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PushSubscription = sequelize.define('PushSubscription', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    endpoint: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    keys_p256dh: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    keys_auth: {
        type: DataTypes.STRING,
        allowNull: false,
    },
}, {
    timestamps: true,
});

module.exports = PushSubscription;
