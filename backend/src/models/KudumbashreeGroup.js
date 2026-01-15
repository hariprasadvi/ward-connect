const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const KudumbashreeGroup = sequelize.define('KudumbashreeGroup', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    type: {
        type: DataTypes.ENUM('NHG', 'ADS', 'CDS'),
        allowNull: false,
        defaultValue: 'NHG',
    },
    ward_number: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    unit_number: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    total_funds: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0.00,
    },
}, {
    timestamps: true,
});

module.exports = KudumbashreeGroup;
