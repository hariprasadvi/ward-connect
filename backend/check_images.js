const fs = require('fs');
const { sequelize } = require('./src/config/database');
const Product = require('./src/models/Product');

const checkImages = async () => {
    try {
        await sequelize.authenticate();

        const products = await Product.findAll();
        const headers = "ID | Title | Image URL\n---|---|---\n";
        const rows = products.map(p => `${p.id} | ${p.title} | ${p.image}`).join('\n');

        fs.writeFileSync('image_list.txt', headers + rows);
        console.log('Written to image_list.txt');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
};

checkImages();
