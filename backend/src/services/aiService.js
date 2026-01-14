const OpenAI = require("openai");
const dotenv = require('dotenv');

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

exports.summarizeMeeting = async (transcript) => {
    if (!transcript) return "No transcript provided.";

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                {
                    role: "system",
                    content: `You are a helpful assistant that summarizes meeting transcripts for Kudumbashree units (neighborhood groups in Kerala). 
                    The transcript is in Malayalam. 
                    Please generate a structured meeting minutes report in **Malayalam**.
                    Include:
                    1. Key decisions made.
                    2. Action items.
                    3. General discussion points.
                    Keep it professional and concise.`
                },
                {
                    role: "user",
                    content: transcript
                }
            ],
            temperature: 0.5,
        });

        return response.choices[0].message.content;
    } catch (error) {
        console.error("OpenAI Error:", error);
        throw error;
    }
};
