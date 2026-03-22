const User = require('./User');
const Product = require('./Product');
const CartItem = require('./CartItem');
const WishlistItem = require('./WishlistItem');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const Notification = require('./Notification');
const Bill = require('./Bill');
const CivicRequest = require('./CivicRequest');
const DonationRequest = require('./DonationRequest');
const MedicineReminder = require('./MedicineReminder');
const HealthRecord = require('./HealthRecord');
const JobAlert = require('./JobAlert');
const Application = require('./Application');
const KudumbashreeGroup = require('./KudumbashreeGroup');
const KudumbashreeProfile = require('./KudumbashreeProfile');
const Loan = require('./Loan');
const Meeting = require('./Meeting');
const Attendance = require('./Attendance');
const FinancialTransaction = require('./FinancialTransaction');
const Booking = require('./booking.model');
const Vehicle = require('./vehicle.model');

console.log("Defining Sequelize associations...");

try {
    // --- Product & Shop ---
    User.hasMany(Product, { foreignKey: 'sellerId' });
    Product.belongsTo(User, { foreignKey: 'sellerId' });
    User.hasMany(CartItem, { foreignKey: 'userId' });
    CartItem.belongsTo(User, { foreignKey: 'userId' });
    Product.hasMany(CartItem, { foreignKey: 'productId' });
    CartItem.belongsTo(Product, { foreignKey: 'productId' });
    User.hasMany(WishlistItem, { foreignKey: 'userId' });
    WishlistItem.belongsTo(User, { foreignKey: 'userId' });
    Product.hasMany(WishlistItem, { foreignKey: 'productId' });
    WishlistItem.belongsTo(Product, { foreignKey: 'productId' });
    User.hasMany(Order, { foreignKey: 'userId' });
    Order.belongsTo(User, { foreignKey: 'userId' });
    Order.hasMany(OrderItem, { foreignKey: 'orderId' });
    OrderItem.belongsTo(Order, { foreignKey: 'orderId' });
    Product.hasMany(OrderItem, { foreignKey: 'productId' });
    OrderItem.belongsTo(Product, { foreignKey: 'productId' });
    console.log("Shop associations loaded.");

    // --- Core Systems ---
    User.hasMany(Notification, { foreignKey: 'userId' });
    Notification.belongsTo(User, { foreignKey: 'userId' });
    User.hasMany(Bill, { foreignKey: 'userId' });
    Bill.belongsTo(User, { foreignKey: 'userId' });
    User.hasMany(CivicRequest, { foreignKey: 'userId' });
    CivicRequest.belongsTo(User, { foreignKey: 'userId' });

    // --- Health ---
    User.hasMany(DonationRequest, { foreignKey: 'userId' });
    DonationRequest.belongsTo(User, { foreignKey: 'userId' });
    User.hasMany(MedicineReminder, { foreignKey: 'userId' });
    MedicineReminder.belongsTo(User, { foreignKey: 'userId' });
    User.hasMany(HealthRecord, { foreignKey: 'userId' });
    HealthRecord.belongsTo(User, { foreignKey: 'userId' });

    // --- Jobs ---
    JobAlert.hasMany(Application, { foreignKey: 'jobId' });
    Application.belongsTo(JobAlert, { foreignKey: 'jobId' });

    // --- Kudumbashree ---
    User.hasOne(KudumbashreeProfile, { foreignKey: 'userId' });
    KudumbashreeProfile.belongsTo(User, { foreignKey: 'userId' });
    KudumbashreeGroup.hasMany(KudumbashreeProfile, { foreignKey: 'groupId' });
    KudumbashreeProfile.belongsTo(KudumbashreeGroup, { foreignKey: 'groupId' });

    User.hasMany(Loan, { foreignKey: 'userId', as: 'UserLoans' }); // Alias for clarity if needed
    Loan.belongsTo(User, { foreignKey: 'userId' });
    KudumbashreeGroup.hasMany(Loan, { foreignKey: 'groupId' });
    Loan.belongsTo(KudumbashreeGroup, { foreignKey: 'groupId' });

    User.hasMany(Attendance, { foreignKey: 'userId' });
    Attendance.belongsTo(User, { foreignKey: 'userId' });
    Meeting.hasMany(Attendance, { foreignKey: 'meetingId' });
    Attendance.belongsTo(Meeting, { foreignKey: 'meetingId' });
    KudumbashreeGroup.hasMany(Meeting, { foreignKey: 'groupId' });
    Meeting.belongsTo(KudumbashreeGroup, { foreignKey: 'groupId' });

    User.hasMany(FinancialTransaction, { foreignKey: 'userId' });
    FinancialTransaction.belongsTo(User, { foreignKey: 'userId' });
    KudumbashreeGroup.hasMany(FinancialTransaction, { foreignKey: 'groupId' });
    FinancialTransaction.belongsTo(KudumbashreeGroup, { foreignKey: 'groupId' });

    console.log("Kudumbashree associations loaded.");

    // --- Vehicle & Booking ---
    User.hasMany(Booking, { foreignKey: 'userId' });
    Booking.belongsTo(User, { foreignKey: 'userId' });
    Vehicle.hasMany(Booking, { foreignKey: 'vehicleId', onDelete: 'CASCADE' });
    Booking.belongsTo(Vehicle, { foreignKey: 'vehicleId', onDelete: 'CASCADE' });
    User.hasMany(Vehicle, { foreignKey: 'ownerId', onDelete: 'CASCADE' });
    Vehicle.belongsTo(User, { foreignKey: 'ownerId', onDelete: 'CASCADE' });
    console.log("Vehicle associations loaded.");

} catch (error) {
    console.error("Error loading Sequelize associations:", error);
}

module.exports = {};
