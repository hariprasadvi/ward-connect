const express = require('express');
const router = express.Router();
const { classifyWaste } = require('../controllers/ai.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.use(authMiddleware);

router.post('/classify', classifyWaste);

module.exports = router;
