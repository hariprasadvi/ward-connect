const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { 
  createPickup, 
  scheduleAdminPickup, 
  getPickups, 
  acknowledgePickup,
  getNotificationCount,
  updatePickupStatus, 
  deletePickup 
} = require('../controllers/wastePickup.controller');

// All routes require authentication
router.use(authenticate);

// User routes - Citizens can create bulk pickup requests
router.post('/', createPickup);
router.get('/', getPickups);
router.get('/notifications', getNotificationCount);
router.put('/:id/acknowledge', acknowledgePickup);

// Admin routes - Waste Management Staff only
router.put('/:id', updatePickupStatus); // Re-added status update logic route for admin if needed, actually usage is via ID.
router.post('/admin-schedule', scheduleAdminPickup);
router.delete('/:id', deletePickup);

module.exports = router;
