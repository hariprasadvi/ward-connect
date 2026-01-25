const http = require('http');

// Helper for requests
async function request(method, path, body = null, token = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: path,
            method: method,
            headers: { 'Content-Type': 'application/json' }
        };
        if (body) options.headers['Content-Length'] = Buffer.byteLength(body);
        if (token) options.headers['Authorization'] = `Bearer ${token}`;

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(data || '{}') }));
        });
        req.on('error', reject);
        if (body) req.write(body);
        req.end();
    });
}

async function runTest() {
    console.log("Starting Full Idea Test (Shop Flow)...");

    // 1. Signup / Login User
    const userCreds = {
        full_name: "Buyer Test",
        mobile_number: "9988776655",
        email: `buyer_${Date.now()}@test.com`,
        role: "Citizen", // Correct enum value
        password: "password123",
        house_number: "H-99",
        ward_number: "5",
        aadhaar_number: `12${Date.now()}`.substring(0, 12),
        address: "Test House"
    };

    console.log("1. Signing up user...");
    let userRes = await request('POST', '/auth/signup', JSON.stringify({ ...userCreds, confirm_password: userCreds.password }));

    if (userRes.status !== 201 && userRes.status !== 200) {
        console.log("User might exist, trying login...");
        // If signup fails, maybe user exists, try login
    }

    console.log("2. Logging in...");
    // Login uses mobile_number, not email
    let loginRes = await request('POST', '/auth/login', JSON.stringify({ mobile_number: userCreds.mobile_number, password: userCreds.password }));
    if (!loginRes.body.token) {
        console.error("Login failed:", loginRes.body);
        return;
    }
    const token = loginRes.body.token;
    console.log("   Login successful. Token acquired.");

    // 2. Mock creating a product (requires Shopkeeper) 
    // We'll skip product creation and assume products exist or fail gracefully if none
    console.log("3. Fetching Products...");
    let prodRes = await request('GET', '/api/shop/products');
    const products = prodRes.body;
    if (!products || products.length === 0) {
        console.error("No products found to buy! Please create a product first.");
        return;
    }
    const product = products[0];
    console.log(`   Found Product: ${product.title} ($${product.price})`);

    // 3. Add to Cart
    console.log("4. Adding to Cart...");
    const cartItem = {
        productId: product.id,
        title: product.title,
        price: product.price,
        image: product.image,
        category: product.category
    };
    let cartRes = await request('POST', '/api/shop/cart', JSON.stringify(cartItem), token);
    console.log(`   Cart Add Status: ${cartRes.status}`);

    // 4. Checkout
    console.log("5. Checking Out...");
    let checkoutRes = await request('POST', '/api/shop/checkout', JSON.stringify({
        shippingAddress: "Updated Address",
        paymentMethod: "Cash on Delivery"
    }), token);

    console.log(`   Checkout Status: ${checkoutRes.status}`);
    console.log("   Checkout Body:", checkoutRes.body);

    if (checkoutRes.status === 201) {
        console.log("SUCCESS: Full Idea (Shop Flow) is Working!");
    } else {
        console.log("FAILURE: Checkout failed.");
    }
}

runTest().catch(console.error);
