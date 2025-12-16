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

module.exports = {
    chat,
    generateCV,
    getJobAlerts,
};
