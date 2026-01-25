const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');

const Order = sequelize.define('Order', {
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
    totalAmount: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'),
        defaultValue: 'Pending',
    },
    shippingAddress: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    paymentMethod: {
        type: DataTypes.STRING,
        defaultValue: 'Cash on Delivery',
    }
}, {
    timestamps: true,
});

// Associations moved to src/models/associations.js

module.exports = Order;
