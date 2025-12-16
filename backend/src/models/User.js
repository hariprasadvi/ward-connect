const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    full_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    mobile_number: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    password_hash: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    role: {
        type: DataTypes.ENUM(
            'Citizen',
            'Ward Member',
            'Panchayat Admin',
            'Kudumbashree Member',
            'Health Worker',
            'Vehicle Owner', // Combined Vehicle Owner / Driver
            'Shopkeeper',
            'Waste Management Staff'
        ),
        allowNull: false,
    },
    ward_number: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    panchayat_name: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    address: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    aadhaar_number: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    id_proof_url: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    is_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false, // For mobile verification
    },
    is_approved: {
        type: DataTypes.BOOLEAN,
        defaultValue: false, // For role approval
    },
}, {
    timestamps: true,
});

module.exports = User;
