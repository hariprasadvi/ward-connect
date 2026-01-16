const CartItem = require('../models/CartItem');
const WishlistItem = require('../models/WishlistItem');
const Product = require('../models/Product');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const User = require('../models/User');

const shopController = {
    // --- Product Management (Seller Hub) ---
    createProduct: async (req, res) => {
        try {
            if (req.user.role !== 'Shopkeeper') { // Ensure case matches enum
                return res.status(403).json({ message: 'Access denied. Shopkeepers only.' });
            }
            let imageUrl = req.body.image;
            if (req.file) {
                const baseUrl = `${req.protocol}://${req.get('host')}`;
                imageUrl = `${baseUrl}/uploads/${req.file.filename}`;
            }

            const product = await Product.create({
                ...req.body,
                image: imageUrl,
                sellerId: req.user.id
            });
            res.json(product);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error creating product' });
        }
    },

    getSellerProducts: async (req, res) => {
        try {
            const products = await Product.findAll({ where: { sellerId: req.user.id } });
            res.json(products);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error fetching products' });
        }
    },

    updateProduct: async (req, res) => {
        try {
            const { id } = req.params;
            const product = await Product.findOne({ where: { id, sellerId: req.user.id } });
            if (!product) return res.status(404).json({ message: 'Product not found or unauthorized' });

            let imageUrl = req.body.image;
            if (req.file) {
                const baseUrl = `${req.protocol}://${req.get('host')}`;
                imageUrl = `${baseUrl}/uploads/${req.file.filename}`;
            } else if (imageUrl === undefined) {
                // Only update image if provided (in body or file)
                // If undefined, do not overwrite existing image with undefined?
                // Sequelize update updates fields present in object.
                // We should prepare updateData.
                imageUrl = product.image; // Keep existing
            }

            const updateData = { ...req.body };
            if (imageUrl) updateData.image = imageUrl;

            await product.update(updateData);
            res.json(product);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error updating product' });
        }
    },

    deleteProduct: async (req, res) => {
        try {
            const { id } = req.params;
            const product = await Product.findOne({ where: { id, sellerId: req.user.id } });
            if (!product) return res.status(404).json({ message: 'Product not found or unauthorized' });

            await product.destroy();
            res.json({ message: 'Product deleted' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error deleting product' });
        }
    },

    // --- Order Management (Seller Hub) ---
    getSellerOrders: async (req, res) => {
        try {
            // Find all order items belonging to products sold by this user
            const orderItems = await OrderItem.findAll({
                include: [
                    {
                        model: Product,
                        where: { sellerId: req.user.id },
                        attributes: ['title', 'image', 'price']
                    },
                    {
                        model: Order,
                        include: [{ model: User, attributes: ['full_name', 'mobile_number', 'address', 'house_number', 'ward_number'] }]
                    }
                ],
                order: [['createdAt', 'DESC']]
            });
            res.json(orderItems);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error fetching orders' });
        }
    },

    updateOrderItemStatus: async (req, res) => {
        try {
            const { id } = req.params;
            const { status } = req.body;

            // Validate user owns the product related to this order item
            const orderItem = await OrderItem.findOne({
                where: { id },
                include: [{ model: Product, where: { sellerId: req.user.id } }]
            });

            if (!orderItem) return res.status(404).json({ message: 'Order Item not found or unauthorized' });

            orderItem.status = status;
            await orderItem.save();
            res.json(orderItem);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error updating order status' });
        }
    },

    // --- Public Shop Data ---
    getAllProducts: async (req, res) => {
        try {
            const products = await Product.findAll();
            res.json(products);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error fetching products' });
        }
    },

    // --- Cart Operations ---
    getCart: async (req, res) => {
        try {
            const items = await CartItem.findAll({
                where: { userId: req.user.id },
                include: [{ model: Product, attributes: ['id', 'title', 'price', 'image', 'category'] }]
            });
            res.json(items);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error fetching cart' });
        }
    },

    addToCart: async (req, res) => {
        try {
            const { productId, title, price, image, category } = req.body;
            let item = await CartItem.findOne({
                where: { userId: req.user.id, productId }
            });

            if (item) {
                item.quantity += 1;
                await item.save();
            } else {
                item = await CartItem.create({
                    userId: req.user.id,
                    productId,
                    productTitle: title,
                    productPrice: price,
                    productImage: image,
                    productCategory: category,
                    quantity: 1
                });
            }
            res.json(item);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error adding to cart' });
        }
    },

    updateCartQuantity: async (req, res) => {
        try {
            const { id } = req.params; // Cart Item ID, NOT product ID
            const { quantity } = req.body;

            const item = await CartItem.findOne({ where: { id, userId: req.user.id } });
            if (!item) return res.status(404).json({ message: 'Item not found' });

            if (quantity <= 0) {
                await item.destroy();
                return res.json({ message: 'Item removed', id: item.id });
            }

            item.quantity = quantity;
            await item.save();
            res.json(item);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error updating quantity' });
        }
    },

    removeFromCart: async (req, res) => {
        try {
            const { id } = req.params;
            await CartItem.destroy({ where: { id, userId: req.user.id } });
            res.json({ message: 'Item removed', id });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error removing item' });
        }
    },

    // --- Wishlist Operations ---
    getWishlist: async (req, res) => {
        try {
            const items = await WishlistItem.findAll({
                where: { userId: req.user.id },
                include: [{ model: Product, attributes: ['id', 'title', 'price', 'image', 'category'] }]
            });
            res.json(items);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error fetching wishlist' });
        }
    },

    addToWishlist: async (req, res) => {
        try {
            const { productId, title, price, image, category } = req.body;

            const existing = await WishlistItem.findOne({
                where: { userId: req.user.id, productId }
            });

            if (existing) {
                return res.json({ message: 'Already in wishlist', item: existing });
            }

            const item = await WishlistItem.create({
                userId: req.user.id,
                productId,
                productTitle: title,
                productPrice: price,
                productImage: image,
                productCategory: category
            });
            res.json(item);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error adding to wishlist' });
        }
    },

    removeFromWishlist: async (req, res) => {
        try {
            const { productId } = req.params; // Using productId for easier toggle logic
            await WishlistItem.destroy({ where: { productId, userId: req.user.id } });
            res.json({ message: 'Removed from wishlist', productId });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error removing from wishlist' });
        }
    }
};

module.exports = shopController;
