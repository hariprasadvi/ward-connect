const Loan = require('../models/Loan');
const User = require('../models/User');

exports.applyLoan = async (req, res) => {
    try {
        const { userId, groupId, amount, purpose, tenure_months } = req.body;
        const loan = await Loan.create({
            userId,
            groupId,
            amount,
            purpose,
            tenure_months,
            status: 'Pending'
        });
        res.status(201).json({ message: 'Loan application submitted', loan });
    } catch (error) {
        res.status(500).json({ message: 'Error applying for loan', error: error.message });
    }
};

exports.getLoans = async (req, res) => {
    try {
        const { userId, groupId } = req.query;
        const where = {};
        if (userId) where.userId = userId;
        if (groupId) where.groupId = groupId;

        const loans = await Loan.findAll({
            where,
            include: [{ model: User, attributes: ['full_name'] }],
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json(loans);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching loans', error: error.message });
    }
};

exports.updateLoanStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'Approved', 'Rejected'

        const loan = await Loan.findByPk(id);
        if (!loan) {
            return res.status(404).json({ message: 'Loan not found' });
        }

        loan.status = status;
        if (status === 'Approved') {
            loan.start_date = new Date();
            loan.status = 'Active'; // Auto set to active on approval? Or Keep as Approved and Active later? Let's say Approved starts it.
        }
        
        await loan.save();

        res.status(200).json({ message: `Loan status updated to ${status}`, loan });
    } catch (error) {
        res.status(500).json({ message: 'Error updating loan status', error: error.message });
    }
};
