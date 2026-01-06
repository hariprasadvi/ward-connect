const { Pickup, User } = require('../models');

const createPickup = async (req, res) => {
  try {
    const { type, scheduledDate, scheduledTime, address, wasteType, quantity, description, houseNumbers } = req.body;
    const userId = req.user.id;
    const user = await User.findByPk(userId);

    const pickup = await Pickup.create({
      userId,
      userName: user.name,
      type,
      scheduledDate,
      scheduledTime,
      address,
      wasteType,
      quantity,
      description,
      houseNumbers,
      status: 'pending'
    });

    res.status(201).json(pickup);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating pickup' });
  }
};

const getPickups = async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      const pickups = await Pickup.findAll({ order: [['createdAt', 'DESC']] });
      res.json(pickups);
    } else {
      const pickups = await Pickup.findAll({ where: { userId: req.user.id }, order: [['createdAt', 'DESC']] });
      res.json(pickups);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching pickups' });
  }
};

const updatePickupStatus = async (req, res) => {
  try {
    // Only admin can update status
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    const { id } = req.params;
    const { status, assignedVehicle } = req.body;
    
    const pickup = await Pickup.findByPk(id);
    if (!pickup) return res.status(404).json({ message: 'Pickup not found' });

    pickup.status = status || pickup.status;
    pickup.assignedVehicle = assignedVehicle || pickup.assignedVehicle;
    await pickup.save();

    res.json(pickup);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating pickup' });
  }
};

module.exports = { createPickup, getPickups, updatePickupStatus };
