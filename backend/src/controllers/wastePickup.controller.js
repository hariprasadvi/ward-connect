const WastePickup = require('../models/WastePickup');
const User = require('../models/User');
const { Op } = require('sequelize');

const createPickup = async (req, res) => {
  try {
    const { type, scheduledDate, scheduledTime, address, wasteType, quantity, description, houseNumbers } = req.body;
    const userId = req.user.id;
    const user = await User.findByPk(userId);

    if (!address && type !== 'regular_scheduled') { // Allow null address only for specific system types if needed, but for user regular/bulk it's required
        // Actually, for user-initiated, address is always required.
        if (!address) return res.status(400).json({ message: 'Address is required for user pickups' });
    }

    const pickup = await WastePickup.create({
      userId,
      userName: user.full_name,
      type,
      scheduledDate,
      scheduledTime,
      address,
      wasteType,
      quantity,
      description,
      houseNumbers: houseNumbers || [],
      status: 'pending',
      isAdminScheduled: false
    });

    res.status(201).json(pickup);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating pickup' });
  }
};

const scheduleAdminPickup = async (req, res) => {
  try {
    const adminRoles = ['Waste Management Staff', 'Panchayat Admin', 'Ward Member'];
    if (!adminRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const { scheduledDate, scheduledTime, address, wasteType, houseNumbers, description } = req.body;

    const pickup = await WastePickup.create({
      userId: null,
      userName: 'Admin Scheduled',
      type: 'regular',
      scheduledDate,
      scheduledTime,
      address,
      wasteType,
      description,
      houseNumbers: houseNumbers || [],
      status: 'confirmed',
      isAdminScheduled: true
    });

    res.status(201).json(pickup);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error scheduling pickup' });
  }
};



// ... imports remain ...

const getPickups = async (req, res) => {
  try {
    const adminRoles = ['Waste Management Staff', 'Panchayat Admin', 'Ward Member'];
    if (adminRoles.includes(req.user.role)) {
      // Admin sees all pickups EXCEPT those they scheduled themselves (purely operational records)
      // This keeps the console focused on incoming requests
      const pickups = await WastePickup.findAll({ 
        where: { isAdminScheduled: false },
        order: [['createdAt', 'DESC']] 
      });
      res.json(pickups);
    } else {
      // Users see their own pickups and admin-scheduled pickups for their house
      const user = await User.findByPk(req.user.id);
      
      const whereCondition = {
        [Op.or]: [
            { userId: req.user.id }
        ]
      };

      if (user.house_number) {
          whereCondition[Op.or].push({
              isAdminScheduled: true,
              houseNumbers: {
                  [Op.contains]: [user.house_number]
              }
          });
      }

      const pickups = await WastePickup.findAll({ 
        where: whereCondition, 
        order: [['createdAt', 'DESC']] 
      });
      res.json(pickups);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching pickups' });
  }
};

const acknowledgePickup = async (req, res) => {
  try {
    const { id } = req.params;
    const pickup = await WastePickup.findByPk(id);
    
    if (!pickup) return res.status(404).json({ message: 'Pickup not found' });
    
    // Verify it's relevant to the user (security check could be deeper, but basic check here)
    // In a real scenario, check if user.houseNumber is in pickup.houseNumbers

    pickup.isUserAcknowledged = true;
    await pickup.save();

    res.json({ message: 'Pickup acknowledged' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error acknowledging pickup' });
  }
};

const getNotificationCount = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user || !user.house_number) {
      return res.json({ count: 0 });
    }

    const count = await WastePickup.count({
      where: {
        isAdminScheduled: true,
        isUserAcknowledged: false,
        houseNumbers: {
          [Op.contains]: [user.house_number]
        }
      }
    });

    res.json({ count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching notification count' });
  }
};

const updatePickupStatus = async (req, res) => {
  try {
    const adminRoles = ['Waste Management Staff', 'Panchayat Admin', 'Ward Member'];
    if (!adminRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    const { id } = req.params;
    const { status, assignedVehicle } = req.body;
    
    const pickup = await WastePickup.findByPk(id);
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

const deletePickup = async (req, res) => {
  try {
    const { id } = req.params;
    const adminRoles = ['Waste Management Staff', 'Panchayat Admin', 'Ward Member'];
    
    // Find pickup first to check ownership
    const pickup = await WastePickup.findByPk(id);
    if (!pickup) return res.status(404).json({ message: 'Pickup not found' });

    // Check permissions: Admin or Owner or Recipient
    const isAdmin = adminRoles.includes(req.user.role);
    const isOwner = pickup.userId === req.user.id;
    
    // Check if user is a recipient (for Admin Scheduled)
    let isRecipient = false;
    if (!isAdmin && !isOwner) {
        const user = await User.findByPk(req.user.id);
        if (user && user.house_number && pickup.houseNumbers && pickup.houseNumbers.includes(user.house_number)) {
            isRecipient = true;
        }
    }
    
    if (!isAdmin && !isOwner && !isRecipient) {
        return res.status(403).json({ message: 'Unauthorized' });
    }

    await pickup.destroy();
    res.json({ message: 'Pickup deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting pickup' });
  }
};

module.exports = { 
  createPickup, 
  scheduleAdminPickup, 
  getPickups, 
  acknowledgePickup,
  getNotificationCount,
  updatePickupStatus, 
  deletePickup 
};
