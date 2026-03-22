const { sequelize } = require('./src/config/database');
const User = require('./src/models/User');

async function test() {
    try {
        await sequelize.authenticate();
        console.log("DB connected");

        const users = await User.findAll({ attributes: ['id', 'full_name', 'role'] });
        console.log("Users in DB:", users.map(u => ({ id: u.id, name: u.full_name, role: `"${u.role}"` })));

    } catch (err) {
        console.error("Error:", err);
    } finally {
        process.exit();
    }
}
test();
