const User = require('../models/User');

const { Op } = require('sequelize');

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      full_name, email, ward_number, panchayat_name, 
      address, aadhaar_number, house_number 
    } = req.body;

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.full_name = full_name || user.full_name;
    user.email = email || user.email;
    user.ward_number = ward_number || user.ward_number;
    user.panchayat_name = panchayat_name || user.panchayat_name;
    user.address = address || user.address;
    user.aadhaar_number = aadhaar_number || user.aadhaar_number;
    user.house_number = house_number || user.house_number;

    await user.save();

    // Recalculate completion
    const completion = calculateCompletion(user);

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        full_name: user.full_name,
        role: user.role,
        house_number: user.house_number,
        completion
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating profile' });
  }
};

const getProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        const completion = calculateCompletion(user);
        res.json({ ...user.toJSON(), completion });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching profile' });
    }
}

const getAllHouseNumbers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['house_number'],
      where: {
        house_number: {
          [Op.ne]: null,
          [Op.ne]: ''
        }
      }
    });

    // Extract unique house numbers
    const houseNumbers = [...new Set(users.map(u => u.house_number))].sort();
    
    res.json(houseNumbers);
  } catch (error) {
    console.error('Error fetching house numbers:', error);
    res.status(500).json({ message: 'Error fetching house numbers' });
  }
};

const calculateCompletion = (user) => {
  const fields = [
    'full_name', 'email', 'house_number', 'ward_number', 
    'panchayat_name', 'address', 'aadhaar_number', 'mobile_number'
  ];
  let filled = 0;
  fields.forEach(f => {
    if (user[f] && user[f].toString().trim() !== '') {
      filled++;
    }
  });
  return Math.round((filled / fields.length) * 100);
};

module.exports = { updateProfile, getProfile, getAllHouseNumbers, calculateCompletion };
