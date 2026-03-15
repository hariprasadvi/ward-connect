const { sequelize } = require('./src/config/database');
const Application = require('./src/models/Application');

const run = async () => {
    try {
        await sequelize.authenticate();
        await sequelize.query('TRUNCATE TABLE "Applications" CASCADE;');
        console.log("Successfully truncated Applications table to fix FK constraints.");
        process.exit(0);
    } catch (err) {
        console.error("Error truncating applications:", err);
        process.exit(1);
    }
}
run();
