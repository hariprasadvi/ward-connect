const http = require('http');

// Simulating the frontend behavior: History contains the initial "model" greeting.
const data = JSON.stringify({
    history: [
        {
            role: "model",
            parts: [{ text: "Hello! I am your AI Career Assistant." }]
        }
    ],
    message: "hi"
});

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/job/chat',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

console.log("Sending request with MODEL-first history...");

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
        console.log('RESPONSE BODY:');
        console.log(body);
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.write(data);
req.end();
