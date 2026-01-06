const express = require('express');
const router = express.Router();
const jobController = require('../controllers/job.controller');

router.post('/chat', jobController.chat);

// CV Generator
router.post('/cv', jobController.generateCV);

// Job Alerts
router.get('/alerts', jobController.getJobAlerts);

// Apply for Job
router.post('/apply', jobController.applyForJob);

module.exports = router;
