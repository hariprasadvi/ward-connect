const express = require('express');
const router = express.Router();
const meetingController = require('../controllers/meeting.controller');

router.post('/schedule', meetingController.scheduleMeeting);
router.get('/', meetingController.getMeetings);
router.post('/record', meetingController.recordMeetingAudio);
router.get('/:id/transcript', meetingController.getMeetingTranscript);

module.exports = router;
