const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');
const KudumbashreeGroup = require('./KudumbashreeGroup');

const Loan = sequelize.define('Loan', {
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
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    purpose: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    interest_rate: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 12.00,
    },
    tenure_months: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    start_date: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    status: {
        type: DataTypes.ENUM('Pending', 'Approved', 'Rejected', 'Active', 'Closed'),
        allowNull: false,
        defaultValue: 'Pending',
    },
    repaid_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
    },
    risk_score: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
    },
    ai_analysis: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    repayment_schedule: {
        type: DataTypes.JSON, // Storing schedule as JSON
        allowNull: true,
    },
    admin_comments: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
}, {
    timestamps: true,
});

Loan.belongsTo(User, { foreignKey: 'userId' });
Loan.belongsTo(KudumbashreeGroup, { foreignKey: 'groupId' });

module.exports = Loan;
