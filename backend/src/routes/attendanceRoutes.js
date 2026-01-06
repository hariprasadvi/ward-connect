const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendance.controller');

router.post('/', attendanceController.markAttendance);
router.post('/mark-with-payment', attendanceController.markAttendanceWithPayment);
router.post('/generate-payment-qr', attendanceController.generatePaymentQR);

module.exports = router;
