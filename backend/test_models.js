const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

async function run() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // Iterating common model names to find one that works
    const models = ["gemini-pro", "gemini-1.5-flash", "gemini-1.5-pro"];

    for (const modelName of models) {
        try {
            console.log(`Testing model: ${modelName}`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Hello");
            const response = await result.response;
            console.log(`SUCCESS with ${modelName}:`, response.text());
            return; // Exit on success
        } catch (error) {
            console.log(`FAILED with ${modelName}:`, error.message);
        }
    }
}

run();
