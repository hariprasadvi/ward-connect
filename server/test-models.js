
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        // There isn't a direct "list models" on the instance easily without using the model manager in older SDKs?
        // Actually typically separate. 
        // Let's checks the official way:
        // It's usually NOT via getGenerativeModel.
        // But since I don't want to look up docs, I'll try a common one.
        // "gemini-1.5-flash-latest"
        console.log("Testing gemini-1.5-flash-latest...");
        const model2 = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
        const result = await model2.generateContent("Hello");
        console.log("Success with gemini-1.5-flash-latest");
    } catch (error) {
        console.log("Error:", error.message);
    }
}

listModels();
