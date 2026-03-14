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
<<<<<<< Updated upstream
        const genAI = getGenAI();
        if (!genAI) {
            console.warn("Gemini API Key missing. Returning mock data.");
            return { transcript: "Mock Transcript: API Key Missing", summary: "Mock Summary: API Key Missing" };
        }
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
=======
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
>>>>>>> Stashed changes

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

exports.transcribeAudioChunk = async (audioBuffer, mimeType) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const audioBase64 = audioBuffer.toString('base64');
        const prompt = `
        Provide ONLY the Malayalam transcription for this short audio clip. Do not include any other text or markdown.
        `;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    mimeType: mimeType || 'audio/webm',
                    data: audioBase64
                }
            }
        ]);

        const response = await result.response;
        return response.text().trim();
    } catch (error) {
        console.error("Gemini AI API Error (Chunk):", error);
        return ""; // return empty on error so stream doesn't crash
    }
};

exports.finalizeAudioTranscription = async (fullTranscript) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const prompt = `
        You are an intelligent assistant for Kudumbashree (neighborhood groups in Kerala).
        Given the following complete Malayalam transcript of a meeting:
        ===
        ${fullTranscript}
        ===
        Provide a structured "Meeting Minutes" summary in **Malayalam**, including Key Decisions and Action Items.
        
        Format your response as a JSON object strictly like this:
        {
            "summary": "Structured Malayalam summary here..."
        }
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text().replace(/```json/g, '').replace(/```/g, '').trim();
        
        try {
            return JSON.parse(text);
        } catch (e) {
            return { summary: text };
        }
    } catch (error) {
        console.error("Gemini AI API Error (Finalize):", error);
        throw error;
    }
};

exports.generateReport = async (data, type) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-001" });
        
        const prompt = `
        You are a financial and administrative analyst for Kudumbashree.
        
        Report Type: **${type} Report**
        
        Analyze the following JSON data representing the current status of the unit:
        ${JSON.stringify(data)}
        
        **Instructions**:
        1. Provide a professional report in English.
        2. Identify key trends (e.g., high repayment rates, low attendance, rising funds).
        3. Highlight any critical issues (e.g., high overdue, specific members lagging).
        4. Provide actionable recommendations for improvement.
        5. Format the output in Markdown suitable for rendering (Headings, bold text, bullet points).
        
        Do NOT wrap the output in JSON. Return the raw Markdown text.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();

    } catch (error) {
        console.error("Gemini Report Gen Error:", error);
        throw new Error("Failed to generate AI report");
    }
};
