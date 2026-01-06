const express = require('express');
const router = express.Router();
const memberController = require('../controllers/member.controller');

router.get('/profile', memberController.getProfile);
router.get('/members', memberController.getAllMembers);
router.post('/approve/:userId', memberController.approveMember);
router.post('/reject/:userId', memberController.rejectMember);

module.exports = router;
