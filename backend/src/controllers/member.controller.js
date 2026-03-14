const KudumbashreeProfile = require('../models/KudumbashreeProfile');
const User = require('../models/User');
const KudumbashreeGroup = require('../models/KudumbashreeGroup');

exports.getProfile = async (req, res) => {
    try {
        const userId = req.user ? req.user.id : req.query.userId; // Support both auth middleware and query for testing
        const profile = await KudumbashreeProfile.findOne({
            where: { userId },
            include: [
                { model: User, attributes: ['full_name', 'email', 'mobile_number', 'address'] },
                { model: KudumbashreeGroup }
            ]
        });
        if (!profile) return res.status(404).json({ message: 'Profile not found' });
        res.status(200).json(profile);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching profile', error: error.message });
    }
};

exports.getAllMembers = async (req, res) => {
    try {
        const { groupId } = req.query;
        
        // Fetch All Users with role Kudumbashree Member
        // We use include Profile to optionally get group info, but primary source is User table
        const where = { role: 'Kudumbashree Member' };
        
        const members = await User.findAll({
            where,
            include: [{ 
                model: KudumbashreeProfile, 
                required: false, // Left Join: Get user even if no profile exists
                where: groupId ? { groupId } : undefined 
            }],
            order: [['createdAt', 'DESC']]
        });
        
        res.status(200).json(members);
    } catch (error) {
        console.error("Get All Members Error:", error);
        res.status(500).json({ message: 'Error fetching members', error: error.message });
    }
};

const Loan = require('../models/Loan');
const Attendance = require('../models/Attendance');
const FinancialTransaction = require('../models/FinancialTransaction');
const Notification = require('../models/Notification');
const Booking = require('../models/booking.model');
const WasteComplaint = require('../models/WasteComplaint');
const WastePickup = require('../models/WastePickup');
const Order = require('../models/Order'); // Shop stuff just in case
const CartItem = require('../models/CartItem');
const WishlistItem = require('../models/WishlistItem');

exports.approveMember = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        user.is_approved = true;
        await user.save();
        
        res.json({ message: 'Member approved successfully', user });
    } catch (error) {
        res.status(500).json({ message: 'Error approving member', error: error.message });
    }
};

exports.rejectMember = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        console.log(`[RejectMember] Manually cleaning up data for User ${userId}...`);

        // Manual Cascade Delete - Application Level
        // 1. Kudumbashree Data
        await KudumbashreeProfile.destroy({ where: { userId } });
        await Loan.destroy({ where: { userId } });
        await Attendance.destroy({ where: { userId } });
        await FinancialTransaction.destroy({ where: { userId } }); // Check model definition if it uses userId
        await Notification.destroy({ where: { userId } });

        // 2. Vehicle/Booking Data
        await Booking.destroy({ where: { userId } });

        // 3. Waste Management Data
        await WasteComplaint.destroy({ where: { userId } });
        await WastePickup.destroy({ where: { userId } });

        // 4. Shop Data
        await CartItem.destroy({ where: { userId } });
        await WishlistItem.destroy({ where: { userId } });
        await Order.destroy({ where: { userId } }); 
        // Note: Deleting orders might be risky for history, but this is "Reject/Delete User" so assuming wipe.

        // 5. Finally Delete User
        await user.destroy(); 
        console.log(`[RejectMember] User ${userId} deleted successfully.`);
        
        res.json({ message: 'Member rejected and removed' });
    } catch (error) {
        console.error("Reject Member Error:", error);
        res.status(500).json({ message: 'Error rejecting member', error: error.message });
    }
};
