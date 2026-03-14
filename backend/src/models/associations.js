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
User.hasMany(Notification, { foreignKey: 'userId', onDelete: 'CASCADE' });
Notification.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE' });

<<<<<<< Updated upstream
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
=======
// --- Kudumbashree Associations ---
const KudumbashreeProfile = require('./KudumbashreeProfile');
const KudumbashreeGroup = require('./KudumbashreeGroup');

User.hasOne(KudumbashreeProfile, { foreignKey: 'userId', onDelete: 'CASCADE' });
KudumbashreeProfile.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE' });

KudumbashreeGroup.hasMany(KudumbashreeProfile, { foreignKey: 'groupId' });
KudumbashreeProfile.belongsTo(KudumbashreeGroup, { foreignKey: 'groupId' });

const Loan = require('./Loan');
User.hasMany(Loan, { foreignKey: 'userId', onDelete: 'CASCADE' });
Loan.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE' });

const Attendance = require('./Attendance');
User.hasMany(Attendance, { foreignKey: 'userId', onDelete: 'CASCADE' });
Attendance.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE' });

const FinancialTransaction = require('./FinancialTransaction');
User.hasMany(FinancialTransaction, { foreignKey: 'userId', onDelete: 'CASCADE' });
FinancialTransaction.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE' });

// --- Booking & Vehicle Associations ---
const Booking = require('./booking.model');
User.hasMany(Booking, { foreignKey: 'userId', onDelete: 'CASCADE' });
Booking.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE' });

// --- Waste Management Associations ---
const WasteComplaint = require('./WasteComplaint');
const WastePickup = require('./WastePickup');

// Manual define if not in their files
User.hasMany(WasteComplaint, { foreignKey: 'userId', onDelete: 'CASCADE' });
WasteComplaint.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE' });

User.hasMany(WastePickup, { foreignKey: 'userId', onDelete: 'CASCADE' });
WastePickup.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE' });

console.log("All Shop, Kudumbashree, Booking & Waste associations loaded.");
>>>>>>> Stashed changes
