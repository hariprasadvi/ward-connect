const User = require('./User');
const Product = require('./Product');
const CartItem = require('./CartItem');
const WishlistItem = require('./WishlistItem');
const Order = require('./Order');
const OrderItem = require('./OrderItem');

// CartItem Associations
CartItem.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(CartItem, { foreignKey: 'userId' });
CartItem.belongsTo(Product, { foreignKey: 'productId' });
Product.hasMany(CartItem, { foreignKey: 'productId' });

// WishlistItem Associations
WishlistItem.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(WishlistItem, { foreignKey: 'userId' });
WishlistItem.belongsTo(Product, { foreignKey: 'productId' });
Product.hasMany(WishlistItem, { foreignKey: 'productId' });

console.log("Extra associations loaded.");
