const { sequelize } = require('./src/config/database');
const Booking = require('./src/models/booking.model');
const User = require('./src/models/User');

const cleanDatabase = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // Find all bookings with invalid userIds
        const bookings = await Booking.findAll();
        const users = await User.findAll();
        const userIds = users.map(u => u.id);

        const invalidBookings = bookings.filter(b => !userIds.includes(b.userId));

        if (invalidBookings.length > 0) {
            console.log(`Found ${invalidBookings.length} invalid bookings. Deleting...`);
            for (const booking of invalidBookings) {
                await booking.destroy();
                console.log(`Deleted booking ${booking.id} (user ${booking.userId})`);
            }
        } else {
            console.log('No invalid bookings found.');
        }

        console.log('Cleanup complete.');
    } catch (error) {
        console.error('Error during cleanup:', error);
    } finally {
        await sequelize.close();
    }
};

cleanDatabase();
