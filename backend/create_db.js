const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

// Connect to default 'postgres' db to create the new one
const sequelize = new Sequelize(
    'postgres',
    process.env.DB_USER,
    process.env.DB_PASS,
    {
        host: process.env.DB_HOST,
        dialect: process.env.DB_DIALECT || 'postgres',
        logging: false,
    }
);

(async () => {
    try {
        await sequelize.authenticate();
        console.log('Connected to default postgres database.');

        const dbName = process.env.DB_NAME || 'wardconnect';
        console.log(`Creating database "${dbName}"...`);

        await sequelize.query(`CREATE DATABASE "${dbName}";`);
        console.log(`Database "${dbName}" created successfully.`);
    } catch (error) {
        if (error.original && error.original.code === '42P04') {
            console.log(`Database "${process.env.DB_NAME}" already exists.`);
        } else {
            console.error('Error creating database:', error);
        }
    } finally {
        await sequelize.close();
    }
})();
