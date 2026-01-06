const WasteComplaint = require('../models/WasteComplaint');
const User = require('../models/User');

const createComplaint = async (req, res) => {
  try {
    const { title, description, category, location, photoUrl } = req.body;
    const userId = req.user.id;
    const user = await User.findByPk(userId);

    const complaint = await WasteComplaint.create({
      userId,
      userName: user.full_name,
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
    const adminRoles = ['Waste Management Staff', 'Panchayat Admin', 'Ward Member'];
    if (adminRoles.includes(req.user.role)) {
      // Admin sees all complaints
      const complaints = await WasteComplaint.findAll({ order: [['createdAt', 'DESC']] });
      res.json(complaints);
    } else {
      // Users see only their own complaints
      const complaints = await WasteComplaint.findAll({ 
        where: { userId: req.user.id }, 
        order: [['createdAt', 'DESC']] 
      });
      res.json(complaints);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching complaints' });
  }
};

const updateComplaintStatus = async (req, res) => {
  try {
    // Authorized roles for management
    const adminRoles = ['Waste Management Staff', 'Panchayat Admin', 'Ward Member'];
    if (!adminRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    const { id } = req.params;
    const { status, assignedStaff, adminResponse } = req.body;

    const complaint = await WasteComplaint.findByPk(id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    complaint.status = status || complaint.status;
    complaint.assignedStaff = assignedStaff || complaint.assignedStaff;
    complaint.adminResponse = adminResponse || complaint.adminResponse;
    if (status === 'resolved' || status === 'closed') {
      complaint.resolvedAt = new Date();
    }
    await complaint.save();

    res.json(complaint);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating complaint' });
  }
};

const deleteComplaint = async (req, res) => {
  try {
    const adminRoles = ['Waste Management Staff', 'Panchayat Admin', 'Ward Member'];
    if (!adminRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    const { id } = req.params;

    const complaint = await WasteComplaint.findByPk(id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    await complaint.destroy();
    res.json({ message: 'Complaint deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting complaint' });
  }
};

module.exports = { createComplaint, getComplaints, updateComplaintStatus, deleteComplaint };
