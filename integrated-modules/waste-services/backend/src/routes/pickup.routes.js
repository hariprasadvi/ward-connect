const express = require('express');
const router = express.Router();
const { createPickup, getPickups, updatePickupStatus } = require('../controllers/pickup.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.use(authMiddleware);

router.post('/', createPickup);
router.get('/', getPickups);
router.put('/:id', updatePickupStatus);

module.exports = router;
