const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');

router.post('/chat', jobController.chat);
router.post('/generate-cv', jobController.generateCV);
router.get('/jobs', jobController.getJobs);
router.post('/apply', jobController.applyForJob);
router.post('/subscribe', jobController.subscribeToAlerts);

module.exports = router;
