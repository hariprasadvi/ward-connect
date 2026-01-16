const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Order = require('./Order');
const Product = require('./Product');

const OrderItem = sequelize.define('OrderItem', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    orderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Order,
            key: 'id',
        },
    },
    productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Product,
            key: 'id',
        },
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
    },
    price: { // Snapshot of price at time of purchase
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    status: { // Per-item status for seller management
        type: DataTypes.ENUM('Pending', 'In Progress', 'Shipped', 'Delivered', 'Cancelled'),
        defaultValue: 'Pending',
    }
}, {
    timestamps: true,
});

Order.hasMany(OrderItem, { foreignKey: 'orderId' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });

Product.hasMany(OrderItem, { foreignKey: 'productId' });
OrderItem.belongsTo(Product, { foreignKey: 'productId' });

module.exports = OrderItem;
