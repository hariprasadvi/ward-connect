const express = require('express');
const router = express.Router();
const houseMessageController = require('../controllers/houseMessage.controller');
const { authenticate } = require('../middleware/auth');

router.post('/broadcast', authenticate, houseMessageController.broadcastToHouse);
router.get('/my-alerts', authenticate, houseMessageController.getMessagesForHouse);

module.exports = router;
