const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');
const KudumbashreeGroup = require('./KudumbashreeGroup');

const FinancialTransaction = sequelize.define('FinancialTransaction', {
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
    type: {
        type: DataTypes.ENUM('Thrift', 'Loan Repayment', 'Fine', 'Other'),
        allowNull: false,
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    status: {
        type: DataTypes.ENUM('Success', 'Pending', 'Failed'),
        allowNull: false,
        defaultValue: 'Success',
    },
    transaction_id: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
    },
}, {
    timestamps: true,
});

FinancialTransaction.belongsTo(User, { foreignKey: 'userId' });
FinancialTransaction.belongsTo(KudumbashreeGroup, { foreignKey: 'groupId' });

module.exports = FinancialTransaction;
