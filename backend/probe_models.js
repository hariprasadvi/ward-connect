const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const systemInstruction = "You are a test bot.";

async function probe(modelName) {
    console.log(`\nProbing ${modelName} with systemInstruction...`);
    try {
        const model = genAI.getGenerativeModel({
            model: modelName,
            systemInstruction: systemInstruction
        });
        const result = await model.generateContent("Say hi");
        console.log(`✅ SUCCESS: ${modelName} works! Response: ${result.response.text()}`);
        return true;
    } catch (e) {
        console.log(`❌ FAIL: ${modelName} - ${e.message.split('\n')[0]}`);
        return false;
    }
}

async function run() {
    const candidates = [
        "gemini-1.5-flash",
        "gemini-1.5-flash-001",
        "gemini-1.5-flash-latest",
        "gemini-1.5-pro",
        "gemini-pro",
        "gemini-1.0-pro"
    ];

    for (const c of candidates) {
        if (await probe(c)) break;
    }
}

run();
