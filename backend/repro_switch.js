const { generateChatResponse } = require("./src/services/gemini.service");
const dotenv = require("dotenv");
dotenv.config();

async function testContextSwitch() {
    console.log("--- Testing Context Switch ---");
    // Simulate a history of study-related talk
    const history = [
        { role: "user", parts: [{ text: "What is 2+2?" }] },
        { role: "model", parts: [{ text: "It is 4." }] },
        { role: "user", parts: [{ text: "What is the capital of France?" }] },
        { role: "model", parts: [{ text: "The capital of France is Paris." }] },
    ];

    try {
        console.log("Asking cinema question after history...");
        const response = await generateChatResponse(history, "Tell me about the movie Titanic.");
        console.log("User: Tell me about the movie Titanic.");
        console.log("Bot:", response);

        if (response.includes("I will only answer for learning purpose")) {
            console.log("✅ PASSED: Refusal message received.");
        } else {
            console.log("❌ FAILED: Bot answered.");
        }
    } catch (e) {
        console.error("Error:", e.message);
    }
}

testContextSwitch();
