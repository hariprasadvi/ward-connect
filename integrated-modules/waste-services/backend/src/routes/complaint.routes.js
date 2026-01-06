const express = require('express');
const router = express.Router();
const { createComplaint, getComplaints, updateComplaintStatus } = require('../controllers/complaint.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.use(authMiddleware);

router.post('/', createComplaint);
router.get('/', getComplaints);
router.put('/:id', updateComplaintStatus);

module.exports = router;
