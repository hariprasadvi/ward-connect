const express = require('express');
const router = express.Router();
const loanController = require('../controllers/loan.controller');

router.post('/apply', loanController.applyLoan);
router.get('/', loanController.getLoans);
router.put('/:id/status', loanController.updateLoanStatus);

module.exports = router;
