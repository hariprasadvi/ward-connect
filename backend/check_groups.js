const { sequelize } = require('./src/config/database');
const KudumbashreeGroup = require('./src/models/KudumbashreeGroup');

async function checkGroups() {
    try {
        await sequelize.authenticate();
        console.log('DB Connected');
        const groups = await KudumbashreeGroup.findAll();
        console.log('Groups:', groups.map(g => g.id));
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkGroups();
