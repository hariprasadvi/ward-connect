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
        const where = groupId ? { groupId } : {};
        
        // Also fetch by role 'Kudumbashree Member' to ensure we get ALL users, 
        // even those who might have failed profile creation or are new.
        // But current architecture links Profile to User. We should fetch Profiles.
        
        const members = await KudumbashreeProfile.findAll({
            where,
            include: [{ model: User, attributes: ['full_name', 'mobile_number', 'is_active', 'is_approved', 'email', 'ward_number'] }]
        });
        res.status(200).json(members);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching members', error: error.message });
    }
};

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
        
        // Option: Delete user or set some rejected flag
        // For now, let's just delete them to allow re-registration or cleanup
        await user.destroy(); 
        
        res.json({ message: 'Member rejected and removed' });
    } catch (error) {
        res.status(500).json({ message: 'Error rejecting member', error: error.message });
    }
};
