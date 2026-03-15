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
const JobAlert = require('../models/JobAlert');
const { scrapeJobs } = require('../services/jobScraper.service');

const getJobAlerts = async (req, res) => {
    try {
        const jobs = await JobAlert.findAll({
            order: [['createdAt', 'DESC']]
        });
        res.json(jobs);
    } catch (error) {
        console.error("Error fetching job alerts:", error);
        res.status(500).json({ error: "Failed to fetch job alerts." });
    }
};

const triggerScrape = async (req, res) => {
    try {
        // Run scraper in the background without making the user wait
        scrapeJobs();
        res.json({ message: "Job scraping triggered successfully. New jobs will appear shortly." });
    } catch (error) {
        console.error("Error triggering scrape:", error);
        res.status(500).json({ error: "Failed to trigger scrape." });
    }
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

const getMyApplications = async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) return res.status(400).json({ error: 'Email is required.' });

        const applications = await Application.findAll({
            where: { applicantEmail: email },
            order: [['appliedAt', 'DESC']]
        });
        res.json(applications);
    } catch (error) {
        console.error('Error fetching applications:', error);
        res.status(500).json({ error: 'Failed to fetch applications.' });
    }
};

module.exports = {
    chat,
    generateCV,
    getJobAlerts,
    applyForJob,
    triggerScrape,
    getMyApplications
};
