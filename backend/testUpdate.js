const { sequelize } = require('./src/config/database');
const CivicRequest = require('./src/models/CivicRequest');

async function test() {
    try {
        await sequelize.authenticate();
        console.log("DB connected");

        const req = await CivicRequest.findOne();
        if (req) {
            console.log("Found request:", req.id, req.status);
            req.status = 'In-Progress'; // Valid Enum
            req.adminResponse = 'Test update via script';
            await req.save();
            console.log("Save successful!");
        } else {
            console.log("No requests found");
        }

    } catch (err) {
        console.error("Error during save:", err);
    } finally {
        process.exit();
    }
}
test();
