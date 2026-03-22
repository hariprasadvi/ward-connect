const axios = require('axios');
const { sequelize } = require('./src/config/database');
const User = require('./src/models/User');
const jwt = require('jsonwebtoken');

require('dotenv').config();

async function runTest() {
    try {
        await sequelize.authenticate();
        // find a Panchayat Admin
        const user = await User.findOne({ where: { role: 'Panchayat Admin' } });
        if (!user) {
            console.log("No Panchayat Admin found!");
            process.exit();
        }
        
        // Generate Token manually
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        
        console.log("Got token:", token);
        
        const response = await axios.put('http://localhost:5000/api/civic-requests/1/status', {
            status: 'In-Progress',
            adminResponse: 'Tested via Axios'
        }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        
        console.log("Response:", response.status, response.data);
    } catch (error) {
        console.error("Error from API:", error.response?.status, error.response?.data || error.message);
    } finally {
        process.exit();
    }
}
runTest();
