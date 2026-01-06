const { generateChatResponse } = require("./src/services/gemini.service");
const dotenv = require("dotenv");
dotenv.config();

async function testChat() {
    console.log("--- Testing Study Question (empty history) ---");
    try {
        const response1 = await generateChatResponse([], "Explain Newton's second law of motion.");
        console.log("User: Explain Newton's second law of motion.");
        console.log("Bot:", response1);
    } catch (e) {
        console.error("Error in Test 1:", e.message);
    }

    console.log("\n--- Testing Non-Study Question (simulated history) ---");
    // Simulate a history where the bot was previously helpful, to see if it still refuses new bad queries
    const mockHistory = [
        { role: "user", parts: [{ text: "Hello" }] },
        { role: "model", parts: [{ text: "Hello! How can I help you with your studies?" }] }
    ];

    try {
        const response2 = await generateChatResponse(mockHistory, "What is the best pizza topping?");
        console.log("User: What is the best pizza topping?");
        console.log("Bot:", response2);

        if (response2.includes("I will only answer for learning purpose")) {
            console.log("✅ VERIFICATION PASSED: Refusal message received.");
        } else {
            console.log("❌ VERIFICATION FAILED: Did not receive expected refusal message.");
        }
    } catch (e) {
        console.error("Error in Test 2:", e.message);
    }
}

testChat();
