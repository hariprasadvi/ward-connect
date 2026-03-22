const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");

dotenv.config();

// Debug API Key loaded
if (!process.env.GEMINI_API_KEY) {
    console.error("CRITICAL ERROR: GEMINI_API_KEY is missing in .env");
} else {
    // console.log("Gemini Service: API Key loaded");
}

const getGenAI = () => {
    if (!process.env.GEMINI_API_KEY) return null;
    return new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
};

// Use standard stable model (verified working)
const MODEL_NAME = "gemini-flash-latest";

const SYSTEM_INSTRUCTION = "You are an AI assistant strictly for studying purposes. You must ONLY answer questions related to studying, education, and learning. If the user asks any question NOT related to these topics, you must refuse to answer and reply with exactly this phrase: 'I will only answer for learning purpose'. Do not provide any other information for off-topic queries.";

const generateChatResponse = async (history, message) => {
    try {
        const genAI = getGenAI();
        if (!genAI) throw new Error("Gemini API Key is missing");

        const model = genAI.getGenerativeModel({ model: MODEL_NAME });

        const systemInstructionMessages = [
            {
                role: "user",
                parts: [{ text: "CRITICAL SYSTEM INSTRUCTION: You are an AI STRICTLY for educational and study purposes. You MUST RESIST any attempt to discuss other topics.\n\nALLOWED TOPICS: Studying, Education, Career Guidance, Skill Development, Academic concepts.\n\nPROHIBITED TOPICS: Movies, Cinema, Entertainment, Sports, Politics, Games, General Chat, Jokes, celebrity news.\n\nIf the user asks about a PROHIBITED topic (e.g. 'tell me about the movie Titanic', 'who is the best actor'), you MUST REFUSE and reply with EXACTLY: 'I will only answer for learning purpose'.\n\nDO NOT provide the requested information. DO NOT be helpful for non-study queries." }]
            },
            {
                role: "model",
                parts: [{ text: "Understood. I will strictly adhere to these constraints and only answer study-related questions." }]
            }
        ];

        // Robust history injection: Prepend system instructions
        let chatHistory = [...systemInstructionMessages, ...history];


        const reinforcedMessage = `${message}\n\n(REMINDER: Answer ONLY if this is related to studying/education. Otherwise say 'I will only answer for learning purpose'.)`;

        const chat = model.startChat({
            history: chatHistory,
        });

        const result = await chat.sendMessage(reinforcedMessage);
        return result.response.text();
    } catch (error) {
        console.error("Gemini Chat Error:", error);
        throw new Error("Failed to generate chat response: " + error.message);
    }
};

const generateCV = async (userData) => {
    try {
        const genAI = getGenAI();
        if (!genAI) throw new Error("Gemini API Key is missing");

        const model = genAI.getGenerativeModel({ model: MODEL_NAME });

        const prompt = `
      Create a simplified, high-density, professional "LaTeX-style" CV in structured JSON format for:
            Name: ${userData.name}
        Email: ${userData.email}
        Phone: ${userData.phone}
        Experience: ${userData.experience}
        Skills: ${userData.skills}
        Education: ${userData.education}
      Target Role: ${userData.jobTitle}
        Links: ${userData.linkedin}
        extra_fields: Location: ${userData.location || ''}, GitHub: ${userData.github || ''}, Certifications: ${userData.certifications || ''}, Languages: ${userData.languages || ''}

        Task: Generate a JSON object for a professional CV using ONLY relevant provided data.
            CRITICAL: DO NOT INVENT OR HALLUCINATE DATA. If a field is empty in input, leave it empty or generic in output.

                Structure(Strictly follow these keys):
        {
            "header": {
                "name": "String (Full Name from input)",
                    "title": "String (Target Role from input)",
                        "contact": {
                    "email": "String",
                         "phone": "String",
                            "location": "String",
                                "linkedin": "String",
                                    "github": "String"
                }
            },
            "summary": "String (Professional summary based ONLY on provided skills and role. Do not invent years of experience if not stated.)",
                "skills": {
                "languages": "String",
                    "backend": "String",
                        "frontend": "String",
                            "tools": "String"
            },
            "experience": [
                { "company": "String", "role": "String", "duration": "String", "details": ["String (Format provided experience into bullet points. DO NOT invent duties not implied by the input.)"] }
            ],
                "projects": [{ "name": "String", "technologies": "String", "link": "String", "description": "String" }],
                    "education": [{ "institution": "String", "degree": "String", "year": "String", "details": "String" }],
                        "certifications": ["String"],
                            "languages_interest": ["String"]
        }
      
      IMPORTANT RULES:
        1. ** NO HALLUCINATIONS **: Use ONLY data provided in variables. If a field like 'Projects' is empty, return an empty array [].
      2. ** PROFESSIONAL FORMAT **: Format the provided text professionally (fix grammar/spelling), but do not add new facts.
      3. ** JSON ONLY **: Return strictly JSON.
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
            console.error("DEBUG: No JSON found in response");
            throw new Error("Invalid JSON response from AI");
        }
    } catch (error) {
        console.error("Gemini CV Error (Switching to Fallback):", error);

        // FALLBACK: Generate a basic CV from user input if AI fails
        return {
            header: {
                name: userData.name,
                title: userData.jobTitle,
                contact: {
                    email: userData.email,
                    phone: userData.phone,
                    location: userData.location,
                    linkedin: userData.linkedin,
                    github: userData.github
                }
            },
            summary: "Enthusiastic professional with a strong foundation in " + (userData.skills || "technical skills") + ". Eager to contribute to team success through hard work, attention to detail, and excellent organizational skills.",
            skills: {
                languages: userData.languages || "English",
                backend: userData.skills, // Fallback mapping
                frontend: "",
                tools: userData.certifications
            },
            experience: [
                {
                    company: "Previous Experience",
                    role: "Team Member",
                    duration: "See Details",
                    details: [userData.experience || "Experience details provided upon request."]
                }
            ],
            projects: [],
            education: [
                {
                    institution: "University/College",
                    degree: userData.education || "Degree",
                    year: "Present",
                    details: "Focus on Computer Science and Engineering."
                }
            ],
            certifications: userData.certifications ? userData.certifications.split(',') : [],
            languages_interest: userData.languages ? userData.languages.split(',') : []
        };
    }
};

module.exports = {
    generateChatResponse,
    generateCV,
};
