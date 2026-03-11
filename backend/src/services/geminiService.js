const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require('dotenv');

dotenv.config();

// Ensure GEMINI_API_KEY is set in .env
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const getGenAI = () => {
    if (!process.env.GEMINI_API_KEY) return null;
    return new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

exports.processMeetingAudio = async (audioBuffer, mimeType) => {
    try {
        const genAI = getGenAI();
        if (!genAI) {
            console.warn("Gemini API Key missing. Returning mock data.");
            return { transcript: "Mock Transcript: API Key Missing", summary: "Mock Summary: API Key Missing" };
        }
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Convert buffer to base64
        const audioBase64 = audioBuffer.toString('base64');

        const prompt = `
        You are an intelligent assistant for Kudumbashree (neighborhood groups in Kerala).
        Please listen to this Malayalam meeting audio and perform the following TWO tasks:
        
        1. **Transcribe**: Provide a full Malayalam transcription of the audio.
        2. **Summarize**: Provide a structured "Meeting Minutes" summary in **Malayalam**, including Key Decisions and Action Items.
        
        Format your response as a JSON object strictly like this:
        {
            "transcript": "Full Malayalam transcript here...",
            "summary": "Structured Malayalam summary here..."
        }
        `;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    mimeType: mimeType || 'audio/webm', // dependent on what frontend sends
                    data: audioBase64
                }
            }
        ]);

        const response = await result.response;
        let text = response.text();

        // Clean up markdown code blocks if present
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();

        try {
            return JSON.parse(text);
        } catch (e) {
            console.error("Failed to parse JSON from Gemini:", text);
            // Fallback: return raw text as transcript
            return {
                transcript: text,
                summary: "Could not parse structured summary. See transcript."
            };
        }

    } catch (error) {
        console.error("Gemini AI API Error:", error);
        throw error;
    }
};
