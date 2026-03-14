const { sequelize } = require('./src/config/database');
const Product = require('./src/models/Product');
const User = require('./src/models/User');

async function seedProducts() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // Find or create a shopkeeper
        let shopkeeper = await User.findOne({ where: { role: 'Shopkeeper' } });
        if (!shopkeeper) {
            shopkeeper = await User.create({
                full_name: 'Local Farm Shop',
                mobile_number: '9999999990',
                password_hash: 'dummy',
                address: '123 Farm Road',
                house_number: '1',
                ward_number: '1',
                role: 'Shopkeeper'
            });
            console.log('Created dummy shopkeeper.');
        }

        const dummyProducts = [
            {
                title: 'Kerala Kuzhalappam',
                price: 150,
                originalPrice: 180,
                discount: 16,
                category: 'Homemade food products',
                image: 'http://localhost:5000/uploads/kuzhalappam.jpg',
                description: 'Crispy and traditional Kerala style homemade Kuzhalappam snacks, perfect for tea time.',
                stock: 45,
                rating: 4.8,
                reviewsCount: 12,
                sellerId: shopkeeper.id,
            },
            {
                title: 'Sweet Boondi Laddu',
                price: 200,
                originalPrice: 220,
                discount: 9,
                category: 'Homemade food products',
                image: 'http://localhost:5000/uploads/laddu.jpg',
                description: 'Delicious homemade sweet Boondi Laddu made with pure ghee and dry fruits.',
                stock: 30,
                rating: 4.9,
                reviewsCount: 28,
                sellerId: shopkeeper.id,
            },
            {
                title: 'Spicy Kerala Mixture',
                price: 120,
                originalPrice: 140,
                discount: 14,
                category: 'Homemade food products',
                image: 'http://localhost:5000/uploads/mixture.jpg',
                description: 'Crunchy and spicy Kerala style bakery mixture snack with peanuts and curry leaves.',
                stock: 50,
                rating: 4.7,
                reviewsCount: 35,
                sellerId: shopkeeper.id,
            },
            {
                title: 'Crunchy Murukku / Chakli',
                price: 160,
                originalPrice: 200,
                discount: 20,
                category: 'Homemade food products',
                image: 'http://localhost:5000/uploads/murukku.jpg',
                description: 'Traditional handcrafted crispy murukku rings made with rice flour and sesame seeds.',
                stock: 60,
                rating: 4.8,
                reviewsCount: 42,
                sellerId: shopkeeper.id,
            },
            {
                title: 'Fresh Ripened Mangoes',
                price: 300,
                originalPrice: 350,
                discount: 14,
                category: 'Fresh farm produce',
                image: 'http://localhost:5000/uploads/mangoes.jpg',
                description: 'Sweet and juicy fresh farm-picked yellow mangoes with natural rich flavor.',
                stock: 25,
                rating: 5.0,
                reviewsCount: 15,
                sellerId: shopkeeper.id,
            }
        ];

        // First need to delete cart items and wishlist items and order items related to current products
        const CartItem = require('./src/models/CartItem');
        const WishlistItem = require('./src/models/WishlistItem');
        const OrderItem = require('./src/models/OrderItem');

        await CartItem.destroy({ where: {} });
        await WishlistItem.destroy({ where: {} });
        await OrderItem.destroy({ where: {} });

        await Product.destroy({ where: {} });
        console.log('Cleared existing products.');

        // Insert new ones
        await Product.bulkCreate(dummyProducts);
        console.log('Seeded local dummy products successfully.');

        process.exit(0);

    } catch (error) {
        console.error('Error seeding products:', error);
        process.exit(1);
    }
}

seedProducts();
