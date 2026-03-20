const Product = require('./src/models/Product');
const { sequelize } = require('./src/config/database');

const seedProducts = [
  // --- Handicrafts & Art ---
  {
    title: 'Handmade Bamboo Flower Vase',
    price: 450,
    originalPrice: 600,
    discount: 25,
    category: 'Handicrafts',
    image: 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?auto=format&fit=crop&q=80&w=800',
    rating: 4.8,
    reviews: 12,
    description: 'Beautifully crafted bamboo vase made by local artisans. Eco-friendly and perfect for home decor.',
    sellerId: 1
  },
  {
    title: 'Terracotta Hand-painted Pot',
    price: 350,
    originalPrice: 500,
    discount: 30,
    category: 'Handicrafts',
    image: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&q=80&w=800',
    rating: 4.5,
    reviews: 8,
    description: 'Traditional terracotta pot with intricate hand-painted designs. Adds a rustic charm to your garden.',
    sellerId: 1
  },
  // --- Homemade Food & Snacks ---
  {
    title: 'Organic Banana Chips (500g)',
    price: 180,
    originalPrice: 220,
    discount: 18,
    category: 'Food',
    image: 'https://images.unsplash.com/photo-1600271886395-d04bfcd180cd?auto=format&fit=crop&q=80&w=800',
    rating: 4.9,
    reviews: 45,
    description: 'Crispy banana chips made with pure coconut oil and organically grown bananas from our ward.',
    sellerId: 1
  },
  {
    title: 'Homemade Mango Pickle',
    price: 120,
    originalPrice: 150,
    discount: 20,
    category: 'Food',
    image: 'https://images.unsplash.com/photo-1589135340847-57a6b30bb518?auto=format&fit=crop&q=80&w=800',
    rating: 4.7,
    reviews: 28,
    description: 'Spicy and tangy mango pickle made using a traditional grandmother’s recipe without preservatives.',
    sellerId: 1
  },
  // --- Clothing & Textiles ---
  {
    title: 'Hand-woven Cotton Kasavu Saree',
    price: 1850,
    originalPrice: 2500,
    discount: 26,
    category: 'Textiles',
    image: 'https://images.unsplash.com/photo-1610030469983-98e55ec29602?auto=format&fit=crop&q=80&w=800',
    rating: 4.9,
    reviews: 15,
    description: 'Authentic hand-woven Kerala Kasavu saree with fine golden zari border. Directly from the weaver.',
    sellerId: 1
  },
  {
    title: 'Embroidered Jute Tote Bag',
    price: 280,
    originalPrice: 400,
    discount: 30,
    category: 'Textiles',
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=800',
    rating: 4.4,
    reviews: 10,
    description: 'Eco-friendly jute bag with beautiful hand embroidery. Perfect for shopping or daily use.',
    sellerId: 1
  }
];

const seed = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connected to DB for seeding.');
    
    // Use bulkCreate to insert all products
    await Product.bulkCreate(seedProducts);
    console.log('--- Successfully seeded handmade and local products! ---');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
};

seed();
