const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");

dotenv.config();

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
    model: "gemini-flash-latest",
    systemInstruction: "You are an AI assistant strictly for learning, education, career guidance, and skill development. If the user asks about anything unrelated to these topics (e.g., general chit-chat, entertainment, politics, daily life, gossip, etc.), you must refuse to answer and strictly reply with exactly: 'I will only answer for learning purpose'. for valid queries, ALWAYS use clear MARKDOWN structure: Use # Headers for sections, - Bullet lists for points, **Bold** for emphasis, and Code Blocks for code. Do not provide unformatted text blocks."
});

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
      Create a high-quality, ATS-friendly professional CV in Markdown format for:
      Name: ${userData.name}
      Email: ${userData.email}
      Phone: ${userData.phone}
      Experience: ${userData.experience}
      Skills: ${userData.skills}
      Education: ${userData.education}
      Target Role: ${userData.jobTitle}
      Links: ${userData.linkedin}
      extra_fields: Location: ${userData.location || ''}, GitHub: ${userData.github || ''}, Certifications: ${userData.certifications || ''}, Languages: ${userData.languages || ''}
      
      Task: Generate a structured JSON object for a professional CV. 
      DO NOT return Markdown. Return ONLY the JSON object.
      
      Structure (Strictly follow these keys):
      {
        "header": {
          "name": "String",
          "title": "String",
          "contact": { 
             "email": "String", 
             "phone": "String", 
             "location": "String", 
             "linkedin": "String", 
             "github": "String" 
          }
        },
        "summary": "String (Strong 3-4 sentence professional summary tailored to role. If role is empty, base it on skills)",
        "skills": { 
          "languages": "String", 
          "backend": "String", 
          "frontend": "String", 
          "tools": "String" 
        },
        "experience": [ 
             { "company": "String", "role": "String", "duration": "String", "details": ["String"] } 
        ],
        "projects": [ { "name": "String", "technologies": "String", "link": "String", "description": "String" } ],
        "education": [ { "institution": "String", "degree": "String", "year": "String", "details": "String" } ],
        "certifications": [ "String" ],
        "languages_interest": [ "String" ]
      }
      
      IMPORTANT RULES:
      1. **DATA INTEGRITY**: Use the provided input text. DO NOT hallucinate info. If input is empty, return empty string "".
      2. **SKILL PARSING**: If input is "python, java", map them to "languages". If "react", map to "frontend". Fill as many categories as possible from the provided text.
      3. **EXPERIENCE PARSING**: If input has loose text like "worked at Google as intern", parse it into Company="Google", Role="Intern".
      4. **EMPTY FIELDS**: If a field (e.g. GitHub) is not provided in input, set its value to "" (empty string). DO NOT omit the key.
      5. **Smart Formatting**: Ensure company names and titles are Title Case.
      
      IMPORTANT: 
      1. If a field is empty in input, return empty string "", do NOT omit the key.
      2. Categorize 'Skills' input "python,c,java,javscript,html,css" correctly into languages/frontend/backend.
      3. For 'Experience' input like "intership at wynd technolgies pvt ltd", extract Company="Wynd Technologies Pvt Ltd", Role="Intern" (infer if possible), Details=["Contributed to development"].
      4. Ensure all keys are lowercase as specified.
    `;

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        // Robust JSON Extraction
        const jsonStart = text.indexOf('{');
        const jsonEnd = text.lastIndexOf('}');

        if (jsonStart !== -1 && jsonEnd !== -1) {
            const jsonString = text.substring(jsonStart, jsonEnd + 1);
            return JSON.parse(jsonString);
        } else {
            throw new Error("Invalid JSON response from AI");
        }
    } catch (error) {
        console.error("Gemini CV Error:", error);
        throw new Error("Failed to generate CV");
    }
};

module.exports = {
    generateChatResponse,
    generateCV,
};
