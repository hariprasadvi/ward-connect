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
