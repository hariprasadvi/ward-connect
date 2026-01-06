const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Meeting = require('./Meeting');
const User = require('./User');

const Attendance = sequelize.define('Attendance', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    meetingId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Meeting,
            key: 'id',
        },
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id',
        },
    },
    status: {
        type: DataTypes.ENUM('Present', 'Absent'),
        allowNull: false,
        defaultValue: 'Present',
    },
    thrift_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0.00,
    },
    payment_status: {
        type: DataTypes.ENUM('Pending', 'Paid'),
        allowNull: false,
        defaultValue: 'Pending',
    },
    transaction_id: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    latitude: {
        type: DataTypes.DECIMAL(10, 8),
        allowNull: true,
    },
    longitude: {
        type: DataTypes.DECIMAL(11, 8),
        allowNull: true,
    },
    face_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
}, {
    timestamps: true,
});

Attendance.belongsTo(Meeting, { foreignKey: 'meetingId' });
Attendance.belongsTo(User, { foreignKey: 'userId' });

module.exports = Attendance;
