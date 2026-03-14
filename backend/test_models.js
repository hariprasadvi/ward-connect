const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require('dotenv');
dotenv.config();

async function listModels() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // There isn't a direct listModels method on genAI instance in some versions, 
    // but often available via model manager or fallback to trying a known working one.
    // Actually, the SDK doesn't expose listModels directly in the high-level class easily in all versions.
    // Let's try to just run a simple generateContent with a safe model.
    try {
        console.log("Testing gemini-1.5-flash...");
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Hello");
        console.log("gemini-1.5-flash worked:", result.response.text());
    } catch(e) { console.log("gemini-1.5-flash failed:", e.message); }

    try {
        console.log("Testing gemini-pro...");
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent("Hello");
        console.log("gemini-pro worked:", result.response.text());
    } catch(e) { console.log("gemini-pro failed:", e.message); }

  } catch (error) {
    console.error("Error:", error);
  }
}

listModels();
