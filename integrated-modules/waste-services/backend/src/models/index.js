const sequelize = require('../config/database');
const User = require('./user.model');
const Pickup = require('./pickup.model');
const Complaint = require('./complaint.model');

User.hasMany(Pickup, { foreignKey: 'userId' });
Pickup.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Complaint, { foreignKey: 'userId' });
Complaint.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
  sequelize,
  User,
  Pickup,
  Complaint
};
