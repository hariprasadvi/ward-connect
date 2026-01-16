const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CartItem = sequelize.define('CartItem', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    productId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    quantity: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
    // We'll store product snapshot details here to simplify, or join with a real Product table if exists.
    // For now, storing snapshot of basic details to mimic the frontend mock data approach on backend.
    productTitle: {
        type: DataTypes.STRING
    },
    productPrice: {
        type: DataTypes.FLOAT
    },
    productImage: {
        type: DataTypes.STRING
    },
    productCategory: {
        type: DataTypes.STRING
    }
}, {
}, {
    timestamps: true
});

module.exports = CartItem;
