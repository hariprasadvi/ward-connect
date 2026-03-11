const { sequelize } = require('./src/config/database');
const Product = require('./src/models/Product');
const CartItem = require('./src/models/CartItem');
const WishlistItem = require('./src/models/WishlistItem');
const OrderItem = require('./src/models/OrderItem');

async function removeProducts() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        const titlesToRemove = [
            'Organic Tomatoes',
            'Farm Fresh Eggs',
            'Homemade Mango Pickle',
            'Banana Chips (Coconut Oil)',
            'Handwoven Bamboo Baskets',
            'Terracotta Clay Pots',
            'Herbal Hair Oil',
            'Neem & Aloe Vera Soap'
        ];

        // Ensure we remove associated items first if the constraints don't cascade properly
        // Find products first
        const products = await Product.findAll({ where: { title: titlesToRemove } });
        const productIds = products.map(p => p.id);

        if (productIds.length > 0) {
            await CartItem.destroy({ where: { productId: productIds } });
            await WishlistItem.destroy({ where: { productId: productIds } });
            await OrderItem.destroy({ where: { productId: productIds } });

            await Product.destroy({ where: { id: productIds } });
            console.log(`Removed ${productIds.length} old products successfully.`);
        } else {
            console.log('No matching products found to remove.');
        }

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

removeProducts();
