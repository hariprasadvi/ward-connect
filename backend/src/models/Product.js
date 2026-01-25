const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');

const Product = sequelize.define('Product', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    sellerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id',
        },
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    price: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    originalPrice: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    discount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    category: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    image: {
        type: DataTypes.STRING, // URL
        allowNull: true,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    stock: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    rating: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
    },
    reviewsCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    unavailablePincodes: {
        type: DataTypes.TEXT, // Comma separated list of pincodes
        allowNull: true
    }
}, {
    timestamps: true,
});

// Associations moved to src/models/associations.js

module.exports = Product;
