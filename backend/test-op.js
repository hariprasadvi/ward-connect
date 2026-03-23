require('dotenv').config();
const { sequelize } = require('./src/config/database');
const OpBooking = require('./src/models/OpBooking');
const User = require('./src/models/User');

// Initialize associations
require('./src/models/associations');

async function test() {
    try {
        const bookings = await OpBooking.findAll({
            include: [{ model: User, attributes: ['name', 'email', 'phone'] }],
            order: [['createdAt', 'DESC']]
        });
        console.log(`Success! Found ${bookings.length} OP Bookings.`);
    } catch (e) {
        console.error('Error fetching OP bookings:', e);
    } finally {
        process.exit();
    }
}

test();
