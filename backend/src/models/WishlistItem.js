const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const WishlistItem = sequelize.define('WishlistItem', {
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
    // Snapshot details
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

module.exports = WishlistItem;
