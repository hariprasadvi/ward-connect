const User = require('./User');
const Product = require('./Product');
const CartItem = require('./CartItem');
const WishlistItem = require('./WishlistItem');
const Order = require('./Order');
const OrderItem = require('./OrderItem');

// --- Product Associations ---
User.hasMany(Product, { foreignKey: 'sellerId' });
Product.belongsTo(User, { foreignKey: 'sellerId' });

// --- Cart Associations ---
User.hasMany(CartItem, { foreignKey: 'userId' });
CartItem.belongsTo(User, { foreignKey: 'userId' });

Product.hasMany(CartItem, { foreignKey: 'productId' });
CartItem.belongsTo(Product, { foreignKey: 'productId' });

// --- Wishlist Associations ---
User.hasMany(WishlistItem, { foreignKey: 'userId' });
WishlistItem.belongsTo(User, { foreignKey: 'userId' });

Product.hasMany(WishlistItem, { foreignKey: 'productId' });
WishlistItem.belongsTo(Product, { foreignKey: 'productId' });

// --- Order Associations ---
User.hasMany(Order, { foreignKey: 'userId' });
Order.belongsTo(User, { foreignKey: 'userId' });

Order.hasMany(OrderItem, { foreignKey: 'orderId' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });

Product.hasMany(OrderItem, { foreignKey: 'productId' });
OrderItem.belongsTo(Product, { foreignKey: 'productId' });

// --- Notification Associations ---
const Notification = require('./Notification');
User.hasMany(Notification, { foreignKey: 'userId' });
Notification.belongsTo(User, { foreignKey: 'userId' });

// --- Bill Associations ---
const Bill = require('./Bill');
User.hasMany(Bill, { foreignKey: 'userId' });
Bill.belongsTo(User, { foreignKey: 'userId' });

// --- Civic Request Associations ---
const CivicRequest = require('./CivicRequest');
User.hasMany(CivicRequest, { foreignKey: 'userId' });
CivicRequest.belongsTo(User, { foreignKey: 'userId' });

console.log("All Shop associations loaded.");

// --- Health Service Associations ---
const DonationRequest = require('./DonationRequest');
const MedicineReminder = require('./MedicineReminder');
const HealthRecord = require('./HealthRecord');

User.hasMany(DonationRequest, { foreignKey: 'userId' });
DonationRequest.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(MedicineReminder, { foreignKey: 'userId' });
MedicineReminder.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(HealthRecord, { foreignKey: 'userId' });
HealthRecord.belongsTo(User, { foreignKey: 'userId' });
