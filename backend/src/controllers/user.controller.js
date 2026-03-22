const User = require('../models/User');

const { Op } = require('sequelize');

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      full_name, email, ward_number, panchayat_name, 
      address, aadhaar_number, house_number, profile_image
    } = req.body;

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (full_name !== undefined) user.full_name = full_name;
    if (email !== undefined) user.email = email;
    if (ward_number !== undefined) user.ward_number = ward_number;
    if (panchayat_name !== undefined) user.panchayat_name = panchayat_name;
    if (address !== undefined) user.address = address;
    if (aadhaar_number !== undefined) user.aadhaar_number = aadhaar_number;
    if (house_number !== undefined) user.house_number = house_number;
    if (profile_image !== undefined) user.profile_image = profile_image;

    await user.save();

    // Recalculate completion
    const completion = calculateCompletion(user);

    const userResponse = user.toJSON();
    delete userResponse.password_hash; // Security
    userResponse.completion = completion;

    res.json({
      message: 'Profile updated successfully',
      user: userResponse
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
    'panchayat_name', 'address', 'aadhaar_number', 'mobile_number',
    'profile_image'
  ];
  let filled = 0;
  fields.forEach(f => {
    // Check for non-null, non-undefined, and non-empty string values
    if (user[f] !== null && user[f] !== undefined && user[f].toString().trim() !== '') {
      filled++;
    }
  });
  return Math.round((filled / fields.length) * 100);
};

module.exports = { updateProfile, getProfile, getAllHouseNumbers, calculateCompletion };
