const express = require('express');
const router = express.Router();
const healthController = require('../controllers/healthController');
const { authenticate } = require('../middleware/auth'); // Assuming this exists

// Apply auth middleware to all routes
router.use(authenticate);

// Donation Routes
router.post('/donations', healthController.createDonationRequest);
router.get('/donations', healthController.getAllDonationRequests);
router.get('/donations/my', healthController.getUserDonationRequests);

// Medicine Reminder Routes
router.post('/medicines', healthController.addMedicineReminder);
router.get('/medicines', healthController.getMedicineReminders);
router.delete('/medicines/:id', healthController.deleteMedicineReminder);

// Health Record Routes
router.post('/records', healthController.addHealthRecord);
router.get('/records', healthController.getHealthRecords);

// OP Booking Routes
router.post('/op-bookings', healthController.createOpBooking);
router.get('/op-bookings/user', healthController.getUserOpBookings);
router.delete('/op-bookings/:id', healthController.cancelOpBooking);
router.get('/op-bookings/all', healthController.getAllOpBookings);
router.put('/op-bookings/:id/status', healthController.updateOpBookingStatus);

module.exports = router;
