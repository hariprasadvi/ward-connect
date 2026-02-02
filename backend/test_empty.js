const { Sequelize } = require('sequelize');

async function testEmpty() {
    const sequelize = new Sequelize('wardconnect', 'postgres', null, {
        host: 'localhost',
        dialect: 'postgres',
        logging: false,
    });
    try {
        await sequelize.authenticate();
        console.log('Success with empty password');
    } catch (e) {
        console.log('Failed with empty password');
    }
}
testEmpty();
