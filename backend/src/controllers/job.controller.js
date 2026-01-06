const geminiService = require('../services/gemini.service');

const chat = async (req, res) => {
    try {
        const { history, message } = req.body;
        const response = await geminiService.generateChatResponse(history, message);
        res.json({ response });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const generateCV = async (req, res) => {
    try {
        const userData = req.body;
        const markdownCV = await geminiService.generateCV(userData);
        res.json({ cv: markdownCV });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const Application = require('../models/Application');

const getJobAlerts = (req, res) => {
    // Mock Data for now - in real app, fetch from DB
    const jobs = [
        { id: 1, title: 'Web Developer', company: 'Tech Corp', location: 'Remote', type: 'Full-time' },
        { id: 2, title: 'Data Analyst', company: 'Data Inc', location: 'New York', type: 'Part-time' },
        { id: 3, title: 'UX Designer', company: 'Design Studio', location: 'London', type: 'Contract' },
        { id: 4, title: 'Junior Angular Dev', company: 'StartupHub', location: 'Remote', type: 'Internship' },
    ];
    res.json(jobs);
};

const applyForJob = async (req, res) => {
    try {
        const { jobId, jobTitle, company, applicantName, applicantEmail } = req.body;

        if (!applicantName || !applicantEmail) {
            return res.status(400).json({ error: "Name and Email are required." });
        }

        const newApplication = await Application.create({
            jobId,
            jobTitle,
            company,
            applicantName,
            applicantEmail
        });

        res.status(201).json({ message: "Application Submitted Successfully", application: newApplication });
    } catch (error) {
        console.error("Application Error:", error);
        res.status(500).json({ error: "Failed to submit application." });
    }
};

module.exports = {
    chat,
    generateCV,
    getJobAlerts,
    applyForJob
};
