const express = require('express');
const router = express.Router();
const billController = require('../controllers/bill.controller');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, billController.getBills);
router.post('/fetch', authenticate, billController.fetchByConsumer);
router.post('/:id/pay', authenticate, billController.payBill);
router.post('/create-order', authenticate, billController.createOrder);
router.post('/verify-payment', authenticate, billController.verifyPayment);

module.exports = router;
