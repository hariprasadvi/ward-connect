const Loan = require('../models/Loan');
const User = require('../models/User');
const KudumbashreeGroup = require('../models/KudumbashreeGroup');
const FinancialTransaction = require('../models/FinancialTransaction');
const aiService = require('../services/ai.service');
const { sequelize } = require('../config/database');

exports.applyLoan = async (req, res) => {
    try {
        const { userId, groupId, amount, purpose, tenure_months } = req.body;

        // 1. Fetch User and Group details for AI
        const user = await User.findByPk(userId);
        const group = await KudumbashreeGroup.findByPk(groupId);

        if (!user || !group) {
            return res.status(404).json({ message: 'User or Group not found' });
        }

        // 2. AI Risk Assessment
        const aiAssessment = await aiService.assessLoanRisk(user, { amount, purpose, tenure_months }, group);

        // 3. Create Loan with AI results
        const loan = await Loan.create({
            userId,
            groupId,
            amount,
            purpose,
            tenure_months,
            status: 'Pending',
            risk_score: aiAssessment.riskScore,
            ai_analysis: aiAssessment.explanation
        });

        res.status(201).json({ 
            message: 'Loan application submitted successfully', 
            loan,
            ai_assessment: aiAssessment 
        });
    } catch (error) {
        console.error("Apply Loan Error:", error);
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
    const t = await sequelize.transaction();
    try {
        const { id } = req.params;
        const { status, admin_comments } = req.body; // 'Approved', 'Rejected'

        const loan = await Loan.findByPk(id, { transaction: t });
        if (!loan) {
            await t.rollback();
            return res.status(404).json({ message: 'Loan not found' });
        }

        if (status === 'Approved') {
            const group = await KudumbashreeGroup.findByPk(loan.groupId, { transaction: t });
            
            // Fund Check
            if (parseFloat(group.total_funds) < parseFloat(loan.amount)) {
                await t.rollback();
                return res.status(400).json({ message: 'Insufficient group funds to approve this loan.' });
            }

            // Deduct Funds
            group.total_funds = parseFloat(group.total_funds) - parseFloat(loan.amount);
            await group.save({ transaction: t });

            // Create Transaction Record
            await FinancialTransaction.create({
                userId: loan.userId,
                groupId: loan.groupId,
                type: 'Other', // Or specific Loan Disbursal type if enum allows
                amount: loan.amount, // Negative for outflow? Keeping positive as amount involved.
                status: 'Success',
                transaction_id: `LOAN-${loan.id}-${Date.now()}`
            }, { transaction: t });

            loan.start_date = new Date();
            loan.status = 'Active';
        } else {
            loan.status = status;
        }
        
        if (admin_comments) loan.admin_comments = admin_comments;

        await loan.save({ transaction: t });
        await t.commit();

        res.status(200).json({ message: `Loan status updated to ${status}`, loan });
    } catch (error) {
        await t.rollback();
        console.error("Update Loan Status Error:", error);
        res.status(500).json({ message: 'Error updating loan status', error: error.message });
    }
};

exports.repayLoan = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { id } = req.params;
        const { amount } = req.body;

        const loan = await Loan.findByPk(id, { transaction: t });
        if (!loan) {
            await t.rollback();
            return res.status(404).json({ message: 'Loan not found' });
        }

        const group = await KudumbashreeGroup.findByPk(loan.groupId, { transaction: t });

        // Update Loan
        loan.repaid_amount = parseFloat(loan.repaid_amount) + parseFloat(amount);
        if (parseFloat(loan.repaid_amount) >= parseFloat(loan.amount)) {
            loan.status = 'Closed';
        }
        await loan.save({ transaction: t });

        // Update Group Funds
        group.total_funds = parseFloat(group.total_funds) + parseFloat(amount);
        await group.save({ transaction: t });

         // Create Transaction Record
         await FinancialTransaction.create({
            userId: loan.userId,
            groupId: loan.groupId,
            type: 'Loan Repayment',
            amount: amount,
            status: 'Success',
            transaction_id: `REPAY-${loan.id}-${Date.now()}`
        }, { transaction: t });

        await t.commit();
        res.status(200).json({ message: 'Loan repayment successful', loan });

    } catch (error) {
        await t.rollback();
        console.error("Repay Loan Error:", error);
        res.status(500).json({ message: 'Error processing repayment', error: error.message });
    }
};
