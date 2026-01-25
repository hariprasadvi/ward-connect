const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendance.controller');

router.post('/', attendanceController.markAttendance);
router.post('/mark-with-payment', attendanceController.markAttendanceWithPayment);
router.get('/by-meeting/:meetingId', attendanceController.getAttendanceByMeetingId);
router.post('/generate-payment-qr', attendanceController.generatePaymentQR);
router.get('/user-history', attendanceController.getUserAttendanceHistory);

module.exports = router;
