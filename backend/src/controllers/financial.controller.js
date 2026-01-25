const FinancialTransaction = require('../models/FinancialTransaction');
const Attendance = require('../models/Attendance');
const { Op } = require('sequelize');

exports.getFinancialReport = async (req, res) => {
    try {
        const { startDate, endDate, groupId } = req.body;
        const where = {
            date: {
                [Op.between]: [startDate, endDate]
            }
        };
        if (groupId) where.groupId = groupId;

        const transactions = await FinancialTransaction.findAll({ where });
        
        const summary = transactions.reduce((acc, curr) => {
            acc[curr.type] = (acc[curr.type] || 0) + parseFloat(curr.amount);
            acc.total += parseFloat(curr.amount);
            return acc;
        }, { total: 0 });

        res.status(200).json({ summary, transactions });
    } catch (error) {
        res.status(500).json({ message: 'Error generating report', error: error.message });
    }
};

exports.getAttendanceCollections = async (req, res) => {
    try {
        const { groupId } = req.query;
        const where = { type: 'Thrift' };
        if (groupId) where.groupId = groupId;

        const totalThrift = await FinancialTransaction.sum('amount', { where });
        res.status(200).json({ totalThrift: totalThrift || 0 });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching collections', error: error.message });
    }
};

const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize Razorpay
// NOTE: In production, these should be in .env vars: RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_YourKeyHere', // Replace with User's Key if not in env
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'YourSecretHere'
});

exports.createOrder = async (req, res) => {
    try {
        const keyId = process.env.RAZORPAY_KEY_ID;
        const keySecret = process.env.RAZORPAY_KEY_SECRET;

        if (!keyId || !keySecret || keyId.includes('YourKeyHere')) {
            return res.status(400).json({ 
                message: 'Razorpay keys are not configured in Backend .env file. Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.' 
            });
        }

        const { amount, currency = 'INR', receipt, notes } = req.body;
        
        const options = {
            amount: amount * 100, // Amount is in currency subunits.
            currency,
            receipt,
            notes
        };

        const order = await razorpay.orders.create(options);
        // Send the Key ID back to frontend so it doesn't need to be hardcoded there
        res.status(200).json({ ...order, key_id: keyId });
    } catch (error) {
        console.error('Error creating Razorpay order:', error);
        res.status(500).json({ message: 'Error creating order', error: error.message });
    }
};

exports.verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'YourSecretHere')
            .update(body.toString())
            .digest('hex');

        const isAuthentic = expectedSignature === razorpay_signature;

        if (isAuthentic) {
            // Payment verified - Save to DB here if needed
            // Ideally, you call recordPayment here or return success for frontend to call it.
            // For security, it's better to record here.
            
            res.status(200).json({ 
                success: true, 
                message: 'Payment verified successfully',
                transaction_id: razorpay_payment_id 
            });
        } else {
            res.status(400).json({ 
                success: false, 
                message: 'Invalid signature' 
            });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error verifying payment', error: error.message });
    }
};

exports.recordPayment = async (req, res) => {
    try {
        const { userId, groupId, type, amount, transaction_id } = req.body;
        const transaction = await FinancialTransaction.create({
            userId,
            groupId,
            type,
            amount,
            transaction_id,
            status: 'Success'
        });
        res.status(201).json({ message: 'Payment recorded successfully', transaction });
    } catch (error) {
        res.status(500).json({ message: 'Error recording payment', error: error.message });
    }
};

exports.getUserTransactions = async (req, res) => {
    try {
        const { userId } = req.params;
        const transactions = await FinancialTransaction.findAll({
            where: { userId },
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json(transactions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user transactions', error: error.message });
    }
};
