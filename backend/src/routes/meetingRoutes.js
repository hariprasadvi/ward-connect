const express = require('express');
const router = express.Router();
const meetingController = require('../controllers/meeting.controller');

const upload = require('../middleware/upload');

router.post('/schedule', meetingController.scheduleMeeting);
router.get('/', meetingController.getMeetings);
router.post('/record', upload.single('audio'), meetingController.recordMeetingAudio);
router.get('/:id/transcript', meetingController.getMeetingTranscript);
router.get('/:id/status', meetingController.getProcessingStatus);
router.delete('/:id', meetingController.deleteMeeting);

module.exports = router;
