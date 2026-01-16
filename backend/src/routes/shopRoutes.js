const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shopController');
const { authenticate } = require('../middleware/auth');
const { uploadDisk } = require('../middleware/upload');

// --- Public Routes ---
router.get('/products', shopController.getAllProducts); // Get all products

// --- Protected Routes (Require Login) ---
router.use(authenticate);

// Cart Routes
router.get('/cart', shopController.getCart);
router.post('/cart', shopController.addToCart);
router.put('/cart/:id', shopController.updateCartQuantity);
router.delete('/cart/:id', shopController.removeFromCart);
router.post('/checkout', shopController.checkout);

// Wishlist Routes
router.get('/wishlist', shopController.getWishlist);
router.post('/wishlist', shopController.addToWishlist);
router.delete('/wishlist/:productId', shopController.removeFromWishlist);

// Seller Hub Routes
router.post('/products', uploadDisk.single('image'), shopController.createProduct); // Create product
router.get('/seller/products', shopController.getSellerProducts); // Get my products
router.put('/products/:id', uploadDisk.single('image'), shopController.updateProduct); // Update product
router.delete('/products/:id', shopController.deleteProduct); // Delete product

router.get('/seller/orders', shopController.getSellerOrders); // Get my orders
router.put('/seller/orders/:id/status', shopController.updateOrderItemStatus); // Update order status

module.exports = router;
