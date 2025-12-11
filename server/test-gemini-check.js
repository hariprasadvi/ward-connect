require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function test() {
    try {
        console.log("Checking API Key...");
        if (!process.env.GEMINI_API_KEY) {
            console.error("Error: GEMINI_API_KEY is missing in .env");
            return;
        }
        console.log("API Key found (length: " + process.env.GEMINI_API_KEY.length + ")");

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // Using the same model as in the controller
        const modelName = "gemini-flash-latest";
        console.log(`Getting model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });

        // Turn 1
        console.log("--- Turn 1 ---");
        const prompt1 = "Hello, are you working?";
        console.log("User: " + prompt1);

        const chat = model.startChat({
            history: [],
        });

        const result1 = await chat.sendMessage(prompt1);
        const response1 = await result1.response;
        const text1 = response1.text();
        console.log("Model: " + text1);

        // Turn 2
        console.log("--- Turn 2 ---");
        // Simulate what the client sends: The history of previous turn
        const historyForTurn2 = [
            { role: "user", parts: [{ text: prompt1 }] },
            { role: "model", parts: [{ text: text1 }] }
        ];

        console.log("History being sent:", JSON.stringify(historyForTurn2, null, 2));

        const chat2 = model.startChat({
            history: historyForTurn2,
        });

        const prompt2 = "What did I just say?";
        console.log("User: " + prompt2);

        const result2 = await chat2.sendMessage(prompt2);
        const response2 = await result2.response;
        const text2 = response2.text();
        console.log("Model: " + text2);


    } catch (error) {
        console.error("Test Failed:");
        console.error(error.message);
        if (error.message.includes("404")) {
            console.log("Hint: The model name might be invalid. Try 'gemini-1.5-flash' or 'gemini-pro'.");
        }
    }
}

test();
