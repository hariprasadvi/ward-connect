const { Complaint, User } = require('../models');

const createComplaint = async (req, res) => {
  try {
    const { title, description, category, location, photoUrl } = req.body;
    const userId = req.user.id;
    const user = await User.findByPk(userId);

    const complaint = await Complaint.create({
      userId,
      userName: user.name,
      title,
      description,
      category,
      location,
      photoUrl,
      status: 'pending'
    });

    res.status(201).json(complaint);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating complaint' });
  }
};

const getComplaints = async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      const complaints = await Complaint.findAll({ order: [['createdAt', 'DESC']] });
      res.json(complaints);
    } else {
      const complaints = await Complaint.findAll({ where: { userId: req.user.id }, order: [['createdAt', 'DESC']] });
      res.json(complaints);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching complaints' });
  }
};

const updateComplaintStatus = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    const { id } = req.params;
    const { status, assignedStaff } = req.body;

    const complaint = await Complaint.findByPk(id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    complaint.status = status || complaint.status;
    complaint.assignedStaff = assignedStaff || complaint.assignedStaff;
    if (status === 'resolved') complaint.resolvedAt = new Date();
    await complaint.save();

    res.json(complaint);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating complaint' });
  }
};

module.exports = { createComplaint, getComplaints, updateComplaintStatus };
