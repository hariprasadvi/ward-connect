const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { 
  createComplaint, 
  getComplaints, 
  updateComplaintStatus,
  deleteComplaint 
} = require('../controllers/wasteComplaint.controller');

// All routes require authentication
router.use(authenticate);

// User routes - Citizens can create complaints
router.post('/', createComplaint);
router.get('/', getComplaints);

// Admin routes - Waste Management Staff only
router.put('/:id/status', updateComplaintStatus);
router.delete('/:id', deleteComplaint);

module.exports = router;
