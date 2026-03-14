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

// Helper: Check and Apply Overdue
const checkAndApplyOverdue = async (loan, t) => {
    try {
        if (loan.status !== 'Active') return;
        
        const currentDate = new Date();
        const lastCheck = loan.last_penalty_check_date ? new Date(loan.last_penalty_check_date) : new Date(loan.start_date);
        
        // Calculate months passed since last check
        const diffTime = Math.abs(currentDate - lastCheck);
        const diffMonths = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 30)); 
        
        if (diffMonths > 0) {
            // Check if they missed payments
            // Simple Logic: Expected repayment = (Amount / Tenure) * Months_Active
            // Actual Repayment = loan.repaid_amount
            // If Actual < Expected, add penalty
             
            const monthsActive = Math.floor((currentDate - new Date(loan.start_date)) / (1000 * 60 * 60 * 24 * 30));
            if(monthsActive <= 0) return;

            const monthlyEMI = loan.amount / loan.tenure_months;
            const expectedRepaid = monthlyEMI * monthsActive;
            
            if (parseFloat(loan.repaid_amount) < expectedRepaid) {
                 // Missed Payment! Add Penalty
                 // Penalty Policy: Fixed 500 Rs per missed month check cycle OR 2% of outstanding. 
                 // Let's go with fixed 500 for simplicity as per "increase loan amount"
                 const penalty = 500 * diffMonths;
                 
                 loan.entry_amount = parseFloat(loan.amount) + penalty; // Increase total loan amount ?? 
                 // Or just track overdue? User said "loan should be increased automatically"
                 loan.amount = parseFloat(loan.amount) + penalty;
                 loan.overdue_amount = parseFloat(loan.overdue_amount) + penalty;
                 
                 // Update check date
                 loan.last_penalty_check_date = currentDate;
                 
                 await loan.save({ transaction: t });
            }
        }
    } catch (e) {
        console.error("Overdue Check Error:", e);
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
        
        // Lazy Check for Overdue on Fetch (Optional: normally done via Cron)
        // Since we don't have cron, we can do it here but it might slow down read. 
        // For this task, let's just return what's in DB. The overdue MUST be triggered by an action or a specific "refresh" endpoint to be safe.
        // HOWEVER, user asked "automatically". Let's run it for "Active" loans here sequentially (not efficient for large scale but fine here).
        
        for (let loan of loans) {
            if(loan.status === 'Active') {
                await checkAndApplyOverdue(loan, null); // passing null transaction, save directly
            }
        }

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
            loan.last_penalty_check_date = new Date();
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
        const { amount } = req.body; // Payment Amount

        const loan = await Loan.findByPk(id, { transaction: t });
        if (!loan) {
            await t.rollback();
            return res.status(404).json({ message: 'Loan not found' });
        }

        const group = await KudumbashreeGroup.findByPk(loan.groupId, { transaction: t });
        
        let paymentAmount = parseFloat(amount);
        
        // 1. Pay off Overdue first
        if (loan.overdue_amount > 0) {
            if (paymentAmount >= loan.overdue_amount) {
                paymentAmount -= parseFloat(loan.overdue_amount);
                loan.overdue_amount = 0;
            } else {
                loan.overdue_amount -= paymentAmount;
                paymentAmount = 0;
            }
        }
        
        // 2. Pay off Principal/Interest (Tracked in repaid_amount)
        if (paymentAmount > 0) {
            loan.repaid_amount = parseFloat(loan.repaid_amount) + paymentAmount;
        }

        // 3. Check Closure
        // If (Repaid >= Total Amount)
        if (parseFloat(loan.repaid_amount) >= parseFloat(loan.amount)) {
            loan.status = 'Closed';
            loan.overdue_amount = 0; // Clear any tiny residue
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
            amount: amount, // Keeping track of payment
            status: 'Success',
            transaction_id: `REPAY-${loan.id}-${Date.now()}`
        }, { transaction: t });

         // Clear Payment Reminders for THIS specific loan
         const Notification = require('../models/Notification');
         const { Op } = require('sequelize'); // Import Op here or at top

         console.log(`[DEBUG] Attempting to delete notifications for Loan #${loan.id} User ${loan.userId}`);
         const criteria = { 
            userId: loan.userId, 
            type: 'payment_reminder',
            message: { [Op.like]: `%Loan #${loan.id}%` } // Target specific loan msg
        };
        console.log('[DEBUG] Criteria:', JSON.stringify(criteria));

         const destroyed = await Notification.destroy({ // CHANGED: Destroy to remove alert completely
            where: criteria,
            transaction: t 
         });
         console.log(`[DEBUG] Destroyed ${destroyed} notifications.`);

        await t.commit();
        res.status(200).json({ message: 'Loan repayment successful', loan });

    } catch (error) {
        await t.rollback();
        console.error("Repay Loan Error:", error);
        res.status(500).json({ message: 'Error processing repayment', error: error.message });
    }
};

exports.remindLoanPayment = async (req, res) => {
    try {
        const { id } = req.params;
        const loan = await Loan.findByPk(id, { include: User });
        
        if (!loan) return res.status(404).json({ message: 'Loan not found' });
        
        const Notification = require('../models/Notification'); // Lazy load or move to top
        
        await Notification.create({
            userId: loan.userId,
            type: 'payment_reminder',
            message: `Reminder: Payment for Loan #${loan.id} is overdue or due. Please pay ₹${loan.overdue_amount > 0 ? loan.overdue_amount : loan.amount - loan.repaid_amount} soon.`
        });
        
        console.log(`Payment Reminder Sent to ${loan.User.email}`);
        
        res.status(200).json({ message: `Reminder sent successfully to ${loan.User.full_name}` });
    } catch (error) {
        console.error("Remind Error:", error);
        res.status(500).json({ message: 'Error sending reminder', error: error.message });
    }
};
