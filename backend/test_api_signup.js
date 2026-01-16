const http = require('http');

const data = JSON.stringify({
    full_name: "Shop Keeper Test 3",
    mobile_number: "9876599999",
    email: "shop3@test.com",
    role: "Shopkeeper",
    password: "password123",
    confirm_password: "password123",
    house_number: "HO-123",
    ward_number: "1",
    aadhaar_number: "123456789012",
    address: "Market Road"
});

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/auth/signup',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);

    let body = '';
    res.on('data', (chunk) => {
        body += chunk;
    });

    res.on('end', () => {
        console.log('BODY:', body);
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.write(data);
req.end();
