const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const DonationPledge = sequelize.define('DonationPledge', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    unitsDonated: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
    }
});

module.exports = DonationPledge;
