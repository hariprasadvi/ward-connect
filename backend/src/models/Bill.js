const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Bill = sequelize.define('Bill', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users', // Check actual table name if it's Users or users
            key: 'id',
        },
    },
    billType: {
        type: DataTypes.ENUM('Electricity', 'Water', 'Gas'),
        allowNull: false,
    },
    consumerNumber: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    dueDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('Pending', 'Paid', 'Overdue', 'Failed'),
        defaultValue: 'Pending',
    },
    paymentDate: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    details: {
        type: DataTypes.JSON,
        allowNull: true,
    },
}, {
    timestamps: true,
});

module.exports = Bill;
