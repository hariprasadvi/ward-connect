
const fetch = require('node-fetch');

async function testChat() {
    try {
        const response = await fetch('http://localhost:3000/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: "Hello, this is a test.",
                history: []
            })
        });

        if (!response.ok) {
            console.log("Response Status:", response.status);
            const text = await response.text();
            console.log("Error Body:", text);
        } else {
            const data = await response.json();
            console.log("Success! Reply:", data.reply);
        }
    } catch (error) {
        console.error("Fetch Error:", error);
    }
}

testChat();
