const { sequelize } = require('./src/config/database');

async function cleanup() {
  try {
    await sequelize.authenticate();
    console.log('Connected to DB for cleanup.');

    console.log('Cleaning up Vehicles...');
    await sequelize.query(
      'DELETE FROM "Vehicles" WHERE "ownerId" NOT IN (SELECT id FROM "Users")',
      { type: sequelize.QueryTypes.DELETE }
    );

    console.log('Cleaning up Bookings (User side)...');
    await sequelize.query(
      'DELETE FROM "Bookings" WHERE "userId" NOT IN (SELECT id FROM "Users")',
      { type: sequelize.QueryTypes.DELETE }
    );

    console.log('Cleaning up Bookings (Vehicle side)...');
    await sequelize.query(
      'DELETE FROM "Bookings" WHERE "vehicleId" NOT IN (SELECT id FROM "Vehicles")',
      { type: sequelize.QueryTypes.DELETE }
    );

    console.log('Cleanup successful.');
    process.exit(0);
  } catch (err) {
    console.error('Cleanup failed:', err);
    process.exit(1);
  }
}

cleanup();
