const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");

dotenv.config();

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const generateChatResponse = async (history, message) => {
    try {
        const chat = model.startChat({
            history: history,
        });

        const result = await chat.sendMessage(message);
        return result.response.text();
    } catch (error) {
        console.error("Gemini Chat Error:", error);
        throw new Error("Failed to generate chat response");
    }
};

const generateCV = async (userData) => {
    try {
        const prompt = `
      Create an ATS-friendly professional CV in Markdown format for the following user:
      Name: ${userData.name}
      Email: ${userData.email}
      Phone: ${userData.phone}
      Experience: ${userData.experience}
      Skills: ${userData.skills}
      Education: ${userData.education}
      
      Structure the CV with:
      1. Header (Name, Contact)
      2. Professional Summary (Generate a strong one based on skills)
      3. Skills Section (Bulleted)
      4. Work Experience (Formatted clearly)
      5. Education
      
      Make it look professional and clean.
    `;

        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error) {
        console.error("Gemini CV Error:", error);
        throw new Error("Failed to generate CV");
    }
};

module.exports = {
    generateChatResponse,
    generateCV,
};
