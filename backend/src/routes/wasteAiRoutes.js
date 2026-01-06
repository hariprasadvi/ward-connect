const express = require('express');
const router = express.Router();
const { classifyWaste } = require('../controllers/wasteAi.controller');

router.post('/classify', classifyWaste);

module.exports = router;
