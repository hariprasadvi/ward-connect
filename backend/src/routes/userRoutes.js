const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate } = require('../middleware/auth');

console.log('User controller:', userController); // Verify exports
router.get('/profile', authenticate, userController.getProfile);
router.put('/profile', authenticate, userController.updateProfile);
router.get('/house-numbers', authenticate, userController.getAllHouseNumbers);

module.exports = router;
