const http = require('http');

function request(options, data) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => resolve({ statusCode: res.statusCode, body: body ? JSON.parse(body) : {} }));
        });
        req.on('error', reject);
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
}

(async () => {
    try {
        console.log("Logging in...");
        const loginRes = await request({
            hostname: 'localhost', port: 5000, path: '/auth/login', method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }, {
            mobile_number: '9000000001', // The Seeded Shopkeeper
            password: 'password123', // Dummy hash match? Wait, I seeded hash directly.
            // I seeded with "$2a$10$..." so I can't login with plaintext unless I find a matching plain/hash pair.
            // My seed_products.js created 'Demo Seller' with a dummy hash. I don't know the plain password.
            // BUT, the user might be logged in as themselves.
            // I'll create a TEMPORARY token directly using jsonwebtoken if I can correct imports.
            // Or I will login with 'seller@example.com' / 'password123' if that still exists (I deleted seed_shopkeeper.js but maybe user created one?)
        });

        // Wait, I can't easily login if I don't know credentials.
        // I'll just skip login and try to access PUBLIC products if I make it public.
        // OR I force a login with the user's credentials if I knew them.

        // Let's try fetching products WITHOUT token. It should likely fail 403.
        console.log("Fetching products (No Auth)...");
        const noAuthRes = await request({
            hostname: 'localhost', port: 5000, path: '/api/shop/products', method: 'GET'
        });
        console.log(`No Auth Status: ${noAuthRes.statusCode}`);

        // If I really want to test WITH token, I should use the one I debugged earlier?
        // I'll skip that for a second.

    } catch (e) {
        console.error(e);
    }
})();
