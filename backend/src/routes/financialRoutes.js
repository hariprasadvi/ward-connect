const express = require('express');
const router = express.Router();
const financialController = require('../controllers/financial.controller');

router.post('/report', financialController.getFinancialReport);
router.get('/attendance-collections', financialController.getAttendanceCollections);
router.post('/record-payment', financialController.recordPayment);

module.exports = router;
