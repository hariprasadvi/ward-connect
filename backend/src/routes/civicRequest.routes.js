const express = require('express');
const router = express.Router();
const { createRequest, getRequests, updateRequestStatus, getNotifications, markNotificationsAsRead } = require('../controllers/civicRequest.controller');
const { authorize } = require('../middleware/auth');
// Routes are protected globally in server.js

router.post('/', createRequest);
router.get('/', getRequests);
router.get('/notifications', getNotifications);
router.put('/notifications/read', markNotificationsAsRead);
router.put('/:id/status', authorize(['Panchayat Admin', 'Ward Member']), updateRequestStatus);

module.exports = router;
