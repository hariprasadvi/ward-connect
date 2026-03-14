const express = require('express');
const router = express.Router();
const { createRequest, getRequests } = require('../controllers/civicRequest.controller');
// Routes are protected globally in server.js

router.post('/', createRequest);
router.get('/', getRequests);

module.exports = router;
