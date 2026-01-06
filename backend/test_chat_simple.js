const geminiService = require('./src/services/gemini.service');
const dotenv = require('dotenv');
dotenv.config();

async function testChat() {
    console.log("Testing Chatbot...");
    try {
        const history = [];
        const message = "Hello, I want to learn Python.";
        const response = await geminiService.generateChatResponse(history, message);
        console.log("Chat Response Success:", response);
    } catch (error) {
        console.error("Chat Failed:", error);
    }
}

testChat();
