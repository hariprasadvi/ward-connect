const fs = require('fs');
const path = require('path');
const { sequelize } = require('./src/config/database');
const Product = require('./src/models/Product');
const User = require('./src/models/User');

const brainDir = 'C:\\Users\\joelj\\.gemini\\antigravity\\brain\\d0f02a16-2152-433f-bce3-06c121f076ae';
const uploadDir = path.join(__dirname, 'uploads');

const photos = [
    {
        filename: 'media__1773137390033.jpg',
        destName: 'kuzhalappam.jpg',
        title: 'Kerala Kuzhalappam',
        category: 'Homemade food products',
        price: 150,
        originalPrice: 180,
        discount: 16,
        description: 'Crispy and traditional Kerala style homemade Kuzhalappam snacks, perfect for tea time.',
        stock: 45,
        rating: 4.8,
        reviewsCount: 12
    },
    {
        filename: 'media__1773137390269.jpg',
        destName: 'laddu.jpg',
        title: 'Sweet Boondi Laddu',
        category: 'Homemade food products',
        price: 200,
        originalPrice: 220,
        discount: 9,
        description: 'Delicious homemade sweet Boondi Laddu made with pure ghee and dry fruits.',
        stock: 30,
        rating: 4.9,
        reviewsCount: 28
    },
    {
        filename: 'media__1773137390357.jpg',
        destName: 'mixture.jpg',
        title: 'Spicy Kerala Mixture',
        category: 'Homemade food products',
        price: 120,
        originalPrice: 140,
        discount: 14,
        description: 'Crunchy and spicy Kerala style bakery mixture snack with peanuts and curry leaves.',
        stock: 50,
        rating: 4.7,
        reviewsCount: 35
    },
    {
        filename: 'media__1773137390372.jpg',
        destName: 'murukku.jpg',
        title: 'Crunchy Murukku / Chakli',
        category: 'Homemade food products',
        price: 160,
        originalPrice: 200,
        discount: 20,
        description: 'Traditional handcrafted crispy murukku rings made with rice flour and sesame seeds.',
        stock: 60,
        rating: 4.8,
        reviewsCount: 42
    },
    {
        filename: 'media__1773137390509.jpg',
        destName: 'mangoes.jpg',
        title: 'Fresh Ripened Mangoes',
        category: 'Fresh farm produce',
        price: 300,
        originalPrice: 350,
        discount: 14,
        description: 'Sweet and juicy fresh farm-picked yellow mangoes with natural rich flavor.',
        stock: 25,
        rating: 5.0,
        reviewsCount: 15
    }
];

async function addNewProducts() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        let shopkeeper = await User.findOne({ where: { role: 'Shopkeeper' } });
        if (!shopkeeper) {
            shopkeeper = await User.create({
                full_name: 'Local Farm Shop',
                mobile_number: '9999999992',
                password_hash: 'dummy',
                address: '123 Farm Road',
                house_number: '1',
                ward_number: '1',
                role: 'Shopkeeper'
            });
        }

        for (const item of photos) {
            const srcPath = path.join(brainDir, item.filename);
            const destPath = path.join(uploadDir, item.destName);
            try {
                fs.copyFileSync(srcPath, destPath);
                console.log('Copied ' + item.filename + ' to ' + item.destName);
            } catch (err) {
                console.error('Error copying file: ' + srcPath, err);
            }

            await Product.create({
                title: item.title,
                price: item.price,
                originalPrice: item.originalPrice,
                discount: item.discount,
                category: item.category,
                image: 'http://localhost:5000/uploads/' + item.destName,
                description: item.description,
                stock: item.stock,
                rating: item.rating,
                reviewsCount: item.reviewsCount,
                sellerId: shopkeeper.id,
            });
            console.log('Added product: ' + item.title);
        }

        console.log('Successfully added new photos as products!');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

addNewProducts();
