const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');
const path = require('path');

// Load env from current directory
dotenv.config({ path: path.join(__dirname, '.env') });

console.log('Checking DB connection...');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT || 5432);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_USER:', process.env.DB_USER);
// Don't log password

const sequelize = new Sequelize(
    process.env.DB_NAME,
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
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error.message);
        if (error.original) {
            console.error('Original Error Code:', error.original.code);
            console.error('Original Error Message:', error.original.message);
        }
    } finally {
        await sequelize.close();
    }
})();
