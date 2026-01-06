const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

async function listModels() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    try {
        // Direct REST call via fetch if the SDK doesn't expose listModels easily, 
        // but SDK usually maps to HTTP. For now, let's try a direct fetch to the endpoint 
        // since the SDK wrapper might be hiding the list method or I don't recall it offhand.
        // Actually, checking standard usage:
        // Since I don't have docs, I will assume `gemini-flash-latest` IS valid but maybe my library version is old?
        // Wait, let's try the library's built-in way if possible, or just print the key info.

        console.log("Testing specific known aliases...");
        const models = ["gemini-1.0-pro", "gemini-1.0-pro-latest", "gemini-pro-vision"];

        for (const modelName of models) {
            try {
                console.log(`Checking ${modelName}...`);
                const model = genAI.getGenerativeModel({ model: modelName });
                await model.generateContent("test");
                console.log(`FOUND WORKING MODEL: ${modelName}`);
                return;
            } catch (e) {
                console.log(`${modelName} failed.`);
            }
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

listModels();
