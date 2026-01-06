const HouseMessage = require('../models/HouseMessage');
const User = require('../models/User');

const broadcastToHouse = async (req, res) => {
  try {
    const { houseNumber, message, type, expiresAt } = req.body;
    
    // Only admins/staff can broadcast
    const adminRoles = ['Waste Management Staff', 'Panchayat Admin', 'Ward Member'];
    if (!adminRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const houseMsg = await HouseMessage.create({
      houseNumber,
      message,
      type,
      expiresAt: expiresAt || null
    });

    res.status(201).json(houseMsg);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error broadcasting message' });
  }
};

const getMessagesForHouse = async (req, res) => {
  try {
    const { houseNumber } = req.user; // From JWT payload
    if (!houseNumber) {
      return res.json([]);
    }

    const messages = await HouseMessage.findAll({
      where: { houseNumber },
      order: [['createdAt', 'DESC']]
    });

    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching messages' });
  }
};

module.exports = { broadcastToHouse, getMessagesForHouse };
