const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');

router.get('/admin-dashboard', reportController.getAdminDashboard);
router.get('/member-dashboard', reportController.getMemberDashboard);

module.exports = router;
