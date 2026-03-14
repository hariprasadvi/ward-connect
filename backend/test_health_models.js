const { sequelize } = require('./src/config/database');
const DonationRequest = require('./src/models/DonationRequest');
const MedicineReminder = require('./src/models/MedicineReminder');
const HealthRecord = require('./src/models/HealthRecord');

(async () => {
    try {
        console.log('Testing model loading...');
        await sequelize.authenticate();
        console.log('Database connection OK.');
        await sequelize.sync({ force: false });
        console.log('Models synced successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Model loading failed:', error);
        process.exit(1);
    }
})();
