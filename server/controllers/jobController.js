const { GoogleGenerativeAI } = require("@google/generative-ai");
const db = require('../db');

exports.chat = async (req, res) => {
    try {
        // Instantiate per request to ensure fresh connection state
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        const { message, history } = req.body;
        console.log("Received chat request. Message length:", message?.length);

        let formattedHistory = [];
        if (history && Array.isArray(history)) {
            formattedHistory = history;
            console.log("Raw history length:", formattedHistory.length);

            // Gemini requires the first message to be from 'user'. 
            // If our client sends the bot's greeting first, remove it.
            if (formattedHistory.length > 0 && formattedHistory[0].role === 'model') {
                console.log("Removing initial model greeting from history.");
                formattedHistory.shift();
            }
        }

        console.log("Formatted history length:", formattedHistory.length);
        if (formattedHistory.length > 0) {
            console.log("First history item:", JSON.stringify(formattedHistory[0]).substring(0, 100) + "...");
            console.log("Last history item:", JSON.stringify(formattedHistory[formattedHistory.length - 1]).substring(0, 100) + "...");
        }

        // Construct the chat history if provided, or start new.
        const chat = model.startChat({
            history: formattedHistory,
            generationConfig: {
                maxOutputTokens: 1000,
            },
        });

        console.log("Sending message to Gemini...");
        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();
        console.log("Received response from Gemini.");

        res.json({ reply: text });
    } catch (error) {
        console.error("Chat Error:", error);
        res.status(500).json({
            error: "Failed to generate response",
            details: error.message,
            apiKeyCheck: process.env.GEMINI_API_KEY ? "Present" : "Missing"
        });
    }
};

exports.generateCV = async (req, res) => {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        const { personalInfo, education, experience, skills } = req.body;

        const prompt = `
      Create a professional CV/Resume friendly for ATS (Applicant Tracking Systems). 
      Here are the details:
      Name: ${personalInfo.name}
      Email: ${personalInfo.email}
      Phone: ${personalInfo.phone}
      
      Education: ${JSON.stringify(education)}
      Experience: ${JSON.stringify(experience)}
      Skills: ${JSON.stringify(skills)}
      
      Please format it in a clean, professional markdown or text structure, including a Professional Summary.
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.json({ cvContent: text });
    } catch (error) {
        console.error("CV Gen Error:", error);
        res.status(500).json({ error: "Failed to generate CV" });
    }
};

exports.getJobs = async (req, res) => {
    // Mock data for now, would connect to DB later
    const jobs = [
        { id: 1, title: "Software Engineer", company: "Tech Ward", location: "Local Ward" },
        { id: 2, title: "Teacher", company: "Local School", location: "Ward 5" }
    ];
    res.json(jobs);
};

exports.applyForJob = async (req, res) => {
    const { jobTitle, company, name, email, phone } = req.body;
    try {
        await db.query(
            'INSERT INTO job_applications (job_title, company, applicant_name, applicant_email, applicant_phone) VALUES ($1, $2, $3, $4, $5)',
            [jobTitle, company, name, email, phone]
        );
        res.json({ message: 'Application submitted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to submit application' });
    }
};

exports.subscribeToAlerts = async (req, res) => {
    const { email } = req.body;
    try {
        await db.query(
            'INSERT INTO job_subscribers (email) VALUES ($1) ON CONFLICT (email) DO NOTHING',
            [email]
        );
        res.json({ message: 'Subscribed successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to subscribe' });
    }
};
