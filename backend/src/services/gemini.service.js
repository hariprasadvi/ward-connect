const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");

dotenv.config();

// Debug API Key loaded
if (!process.env.GEMINI_API_KEY) {
    console.error("CRITICAL ERROR: GEMINI_API_KEY is missing in .env");
} else {
    console.log("Gemini Service: API Key loaded (" + process.env.GEMINI_API_KEY.substring(0, 10) + "...)");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Use standard stable model (verified working)
const MODEL_NAME = "gemini-flash-latest";

const SYSTEM_INSTRUCTION = "You are an AI assistant strictly for studying purposes. You must ONLY answer questions related to studying, education, and learning. If the user asks any question NOT related to these topics, you must refuse to answer and reply with exactly this phrase: 'I will only answer for learning purpose'. Do not provide any other information for off-topic queries.";

const generateChatResponse = async (history, message) => {
    try {
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

        Task: Generate a JSON object for a professional CV that fills an A4 page.
            CRITICAL: The content must be DENSE, DETAILED, and PROFESSIONAL.Avoid brevity.

                Structure(Strictly follow these keys):
        {
            "header": {
                "name": "String (Full Name)",
                    "title": "String (Target Role)",
                        "contact": {
                    "email": "String",
                        "phone": "String",
                            "location": "String",
                                "linkedin": "String",
                                    "github": "String"
                }
            },
            "summary": "String (Comprehensive 4-5 sentence professional summary. Focus on technical depth, achievements, and career goals. Do not be vague.)",
                "skills": {
                "languages": "String",
                    "backend": "String",
                        "frontend": "String",
                            "tools": "String"
            },
            "experience": [
                { "company": "String", "role": "String", "duration": "String", "details": ["String (At least 4-5 detailed bullet points per role. Use action verbs. Quantify results where possible.)"] }
            ],
                "projects": [{ "name": "String", "technologies": "String", "link": "String", "description": "String (Detailed description of the project, architecture, and impact. 3-4 sentences.)" }],
                    "education": [{ "institution": "String", "degree": "String", "year": "String", "details": "String (Include CGPA, coursework, or relevant academic achievements to fill space)" }],
                        "certifications": ["String"],
                            "languages_interest": ["String"]
        }
      
      IMPORTANT RULES:
        1. ** DENSITY IS KEY **: The user wants a "full" CV.If the input is sparse, EXPAND on technical concepts relevant to the keywords provided.
      2. ** NO SHORT ANSWERS **: Bullet points should be long and descriptive(e.g., instead of "Fixed bugs", say "Diagnosed and resolved critical backend concurrency issues, improving API response time by 40%").
      3. ** STRICT SEPARATION **: Standard rules apply(Experience vs Projects).
      4. ** FORMATTING **: Company names and definitions must be professional.
      5. ** EMPTY FIELDS **: Handle gracefully(empty string).
      6. ** JSON ONLY **: Return strictly JSON.
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
