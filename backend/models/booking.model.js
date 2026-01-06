const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');

const Booking = sequelize.define('Booking', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    vehicleId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    source: {
        type: DataTypes.STRING,
        allowNull: false
    },
    destination: {
        type: DataTypes.STRING,
        allowNull: false
    },
    bookingType: {
        type: DataTypes.ENUM('Regular', 'Emergency'),
        defaultValue: 'Regular'
    },
    status: {
        type: DataTypes.ENUM('Pending', 'Confirmed', 'Completed', 'Cancelled'),
        defaultValue: 'Pending'
    },
    bookingTime: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
});

module.exports = Booking;
