const axios = require('axios');
const jwt = require('jsonwebtoken');
require('dotenv').config();

async function test() {
    try {
        // Use Ward Member (User ID 3)
        const token = jwt.sign({ id: 3 }, process.env.JWT_SECRET, { expiresIn: '1d' });
        
        console.log("Token generated for Ward Member (ID 3)");
        const response = await axios.put('http://localhost:5000/api/civic-requests/1/status', {
            status: 'Resolved',
            adminResponse: 'Resolved through automated test.'
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log("Success! Backend responded:", response.status, response.data);
    } catch (err) {
        console.error("Backend Error:", err.response?.status, err.response?.data || err.message);
    }
}
test();
