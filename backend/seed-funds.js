const { sequelize } = require('./src/config/database');
const KudumbashreeGroup = require('./src/models/KudumbashreeGroup');

async function seedFunds() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // Update all groups to have default funds 1000 for testing
        // Or find specific one. We'll update all to be sure.
        const [updatedRows] = await KudumbashreeGroup.update(
            { total_funds: 1000.00 },
            { where: {} }
        );

        console.log(`Updated ${updatedRows} groups with 1000.00 funds.`);
        process.exit(0);
    } catch (error) {
        console.error('Error seeding funds:', error);
        process.exit(1);
    }
}

seedFunds();
