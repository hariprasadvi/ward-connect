const { sequelize } = require('./src/config/database');
const Product = require('./src/models/Product');
const User = require('./src/models/User');

async function seed() {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');

        let seller = await User.findOne({ where: { role: 'Shopkeeper' } });
        if (!seller) {
            seller = await User.create({
                full_name: 'Local Shopkeeper',
                mobile_number: '9999999999',
                password: 'password123',
                role: 'Shopkeeper',
                ward_number: '1',
                house_number: '100',
                address: 'Local Market'
            });
            console.log('Created new Shopkeeper.');
        } else {
            console.log('Using existing Shopkeeper:', seller.id);
        }

        // Delete existing products to clean up the bad images
        await Product.destroy({ where: {} });
        console.log('Cleared existing products.');

        const products = [
            // Fresh farm produce
            {
                title: 'Organic Tomatoes',
                price: 40,
                originalPrice: 50,
                discount: 20,
                category: 'Fresh farm produce',
                image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&q=80',
                description: 'Freshly harvested organic tomatoes from the local ward farm.',
                stock: 100,
                rating: 4.8,
                reviewsCount: 15,
                sellerId: seller.id
            },
            {
                title: 'Farm Fresh Eggs',
                price: 120,
                originalPrice: 150,
                discount: 20,
                category: 'Fresh farm produce',
                image: 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=500&q=80',
                description: 'Free-range eggs from local poultry farms.',
                stock: 50,
                rating: 4.9,
                reviewsCount: 22,
                sellerId: seller.id
            },
            {
                title: 'Fresh Spinach Bundle',
                price: 25,
                originalPrice: 30,
                discount: 15,
                category: 'Fresh farm produce',
                image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500&q=80',
                description: 'Green, healthy spinach harvested today morning.',
                stock: 30,
                rating: 4.5,
                reviewsCount: 8,
                sellerId: seller.id
            },
            // Homemade food products
            {
                title: 'Homemade Mango Pickle',
                price: 150,
                originalPrice: 180,
                discount: 15,
                category: 'Homemade food products',
                image: 'https://images.unsplash.com/photo-1582531065715-ddcbaa361009?w=500&q=80',
                description: 'Traditional home-style spicy mango pickle packed with flavor.',
                stock: 20,
                rating: 4.7,
                reviewsCount: 45,
                sellerId: seller.id
            },
            {
                title: 'Kerala Banana Chips',
                price: 90,
                originalPrice: 100,
                discount: 10,
                category: 'Homemade food products',
                image: 'https://images.unsplash.com/photo-1627361715450-48e02d4151a5?w=500&q=80',
                description: 'Crispy and savory banana chips fried in pure coconut oil.',
                stock: 40,
                rating: 4.9,
                reviewsCount: 120,
                sellerId: seller.id
            },
            {
                title: 'Homemade Multi-Grain Bread',
                price: 60,
                originalPrice: 70,
                discount: 10,
                category: 'Homemade food products',
                image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&q=80',
                description: 'Freshly baked multi-grain bread with local ingredients.',
                stock: 15,
                rating: 4.6,
                reviewsCount: 30,
                sellerId: seller.id
            },
            // Handmade crafts
            {
                title: 'Bamboo Basket weaving',
                price: 250,
                originalPrice: 300,
                discount: 15,
                category: 'Handmade crafts',
                image: 'https://images.unsplash.com/photo-1533618331908-04da6debc7ac?w=500&q=80',
                description: 'Artisanal bamboo basket woven by local crafts groups.',
                stock: 10,
                rating: 4.8,
                reviewsCount: 16,
                sellerId: seller.id
            },
            {
                title: 'Coconut Shell Bowl',
                price: 120,
                originalPrice: 150,
                discount: 20,
                category: 'Handmade crafts',
                image: 'https://images.unsplash.com/photo-1628157588553-5eeea00af15c?w=500&q=80',
                description: 'Eco-friendly and sustainable bowls made from polished coconut shells.',
                stock: 25,
                rating: 4.5,
                reviewsCount: 10,
                sellerId: seller.id
            },
            {
                title: 'Hand-painted Earthen Pot',
                price: 350,
                originalPrice: 400,
                discount: 10,
                category: 'Handmade crafts',
                image: 'https://images.unsplash.com/photo-1610706223595-6b80156d9006?w=500&q=80',
                description: 'Beautifully decorated clay pot ideal for home gardening or decor.',
                stock: 8,
                rating: 4.9,
                reviewsCount: 22,
                sellerId: seller.id
            },
            // Herbal / personal care products
            {
                title: 'Neem & Tulsi Herbal Soap',
                price: 45,
                originalPrice: 60,
                discount: 25,
                category: 'Herbal / personal care products',
                image: 'https://images.unsplash.com/photo-1600857062241-98e5dba7f214?w=500&q=80',
                description: 'Handcrafted soap infused with natural neem and tulsi extracts.',
                stock: 50,
                rating: 4.7,
                reviewsCount: 35,
                sellerId: seller.id
            },
            {
                title: 'Pure Aloe Vera Gel',
                price: 150,
                originalPrice: 200,
                discount: 25,
                category: 'Herbal / personal care products',
                image: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=500&q=80',
                description: 'Locally extracted fresh aloe vera gel for skin care.',
                stock: 20,
                rating: 4.6,
                reviewsCount: 18,
                sellerId: seller.id
            },
            {
                title: 'Herbal Hair Oil',
                price: 220,
                originalPrice: 250,
                discount: 12,
                category: 'Herbal / personal care products',
                image: 'https://images.unsplash.com/photo-1608248593845-a96677f24029?w=500&q=80',
                description: 'Infused with local herbs, amla, and hibiscus for strong and healthy hair.',
                stock: 35,
                rating: 4.8,
                reviewsCount: 60,
                sellerId: seller.id
            }
        ];

        await Product.bulkCreate(products);
        console.log(`Successfully seeded ${products.length} products.`);
    } catch (err) {
        console.error('Error seeding products:', err);
    } finally {
        await sequelize.close();
    }
}

seed();
