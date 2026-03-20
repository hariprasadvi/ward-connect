const Product = require('./src/models/Product');
const { sequelize } = require('./src/config/database');
const { Op } = require('sequelize');

const bags = [
  {
    title: 'Village Hand-stitched Jute Bag',
    price: 320,
    originalPrice: 450,
    discount: 29,
    category: 'Handmade Bags',
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=800',
    rating: 4.6,
    reviews: 18,
    description: 'A durable and stylish jute bag, hand-stitched by local women’s groups. Perfect for everyday shopping.',
    sellerId: 1
  },
  {
    title: 'Traditional Cloth Sling Bag',
    price: 250,
    originalPrice: 350,
    discount: 28,
    category: 'Handmade Bags',
    image: 'https://images.unsplash.com/photo-1598533023411-ca0e1d2b4731?auto=format&fit=crop&q=80&w=800',
    rating: 4.8,
    reviews: 10,
    description: 'Vibrant cloth sling bag made from recycled local textiles. Lightweight and eco-friendly.',
    sellerId: 1
  },
  {
    title: 'Woven Reed Shopping Basket',
    price: 480,
    originalPrice: 650,
    discount: 26,
    category: 'Handmade Bags',
    image: 'https://images.unsplash.com/photo-1510414695470-20ce66e9527f?auto=format&fit=crop&q=80&w=800',
    rating: 4.7,
    reviews: 22,
    description: 'Traditional woven basket made from sturdy river reeds. Very strong and biodegradable.',
    sellerId: 1
  }
];

const cleanAndAdd = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connected to DB.');

    // 1. Remove products with no image or placeholder image
    const deletedCount = await Product.destroy({
      where: {
        [Op.or]: [
          { image: null },
          { image: '' },
          { image: { [Op.like]: '%placeholder%' } },
          { image: { [Op.like]: '%placehold.co%' } }
        ]
      }
    });
    console.log(`--- Removed ${deletedCount} items without proper images. ---`);

    // 2. Add the new handmade bags
    await Product.bulkCreate(bags);
    console.log('--- Successfully added Handmade Bags! ---');

    process.exit(0);
  } catch (err) {
    console.error('Operation failed:', err);
    process.exit(1);
  }
};

cleanAndAdd();
