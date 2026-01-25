const fs = require('fs');
const { sequelize } = require('./src/config/database');
const Product = require('./src/models/Product');

const checkImages = async () => {
    try {
        await sequelize.authenticate();
        const products = await Product.findAll({
            attributes: ['id', 'title', 'image']
        });

        fs.writeFileSync('image_debug_full.json', JSON.stringify(products, null, 2));

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
};

checkImages();
