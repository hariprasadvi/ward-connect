const express = require('express');
const router = express.Router();
const jobController = require('../controllers/job.controller');

router.post('/chat', jobController.chat);
router.post('/cv', jobController.generateCV);
router.get('/alerts', jobController.getJobAlerts);

module.exports = router;
