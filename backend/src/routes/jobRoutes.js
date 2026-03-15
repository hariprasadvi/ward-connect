const express = require('express');
const router = express.Router();
const jobController = require('../controllers/job.controller');

router.post('/chat', jobController.chat);

// CV Generator
router.post('/cv', jobController.generateCV);

// Job Alerts
router.get('/alerts', jobController.getJobAlerts);

// Trigger Job Scrape (Manual trigger for testing/admin)
router.post('/scrape', jobController.triggerScrape);

// Apply for Job
router.post('/apply', jobController.applyForJob);

// Get My Applications (by email)
router.get('/my-applications', jobController.getMyApplications);

module.exports = router;
