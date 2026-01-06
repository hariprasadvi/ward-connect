const { generateChatResponse } = require("./src/services/gemini.service");
const dotenv = require("dotenv");
dotenv.config();

async function testCinema() {
    console.log("--- Testing Cinema Question ---");
    try {
        const response = await generateChatResponse([], "Who won the Oscar for best actor in 2024?");
        console.log("User: Who won the Oscar for best actor in 2024?");
        console.log("Bot:", response);

        if (response.includes("I will only answer for learning purpose")) {
            console.log("✅ PASSED: Refusal message received.");
        } else {
            console.log("❌ FAILED: Bot answered the question.");
        }
    } catch (e) {
        console.error("Error:", e.message);
    }
}

testCinema();
