const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');

router.get('/admin-dashboard', reportController.getAdminDashboard);
router.get('/member-dashboard', reportController.getMemberDashboard);
router.post('/ai-report', reportController.generateAiReport);

module.exports = router;
