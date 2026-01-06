const Attendance = require('../models/Attendance');
const FinancialTransaction = require('../models/FinancialTransaction');
const User = require('../models/User');

exports.markAttendance = async (req, res) => {
    try {
        const { meetingId, userId, status, thrift_amount, latitude, longitude, face_verified } = req.body;
        
        // Simple verification simulation
        if (!face_verified) {
             return res.status(400).json({ message: 'Face verification failed.' });
        }

        const attendance = await Attendance.create({
            meetingId,
            userId,
            status,
            thrift_amount: thrift_amount || 0,
            payment_status: 'Pending',
            latitude,
            longitude,
            face_verified
        });
        res.status(201).json({ message: 'Attendance marked successfully with verified location and face.', attendance });
    } catch (error) {
        res.status(500).json({ message: 'Error marking attendance', error: error.message });
    }
};

exports.markAttendanceWithPayment = async (req, res) => {
    try {
        const { meetingId, userId, status, thrift_amount, groupId, latitude, longitude, face_verified } = req.body;
        
        if (!face_verified) {
             return res.status(400).json({ message: 'Face verification failed.' });
        }

        // 1. Create Financial Transaction
        const transaction = await FinancialTransaction.create({
            userId,
            groupId,
            type: 'Thrift',
            amount: thrift_amount,
            status: 'Success',
            transaction_id: `TXN_${Date.now()}`
        });

        // 2. Mark Attendance
        const attendance = await Attendance.create({
            meetingId,
            userId,
            status,
            thrift_amount,
            payment_status: 'Paid',
            transaction_id: transaction.transaction_id,
            latitude,
            longitude,
            face_verified
        });

        res.status(201).json({ message: 'Attendance and payment recorded with verification.', attendance, transaction });
    } catch (error) {
        res.status(500).json({ message: 'Error recording attendance with payment', error: error.message });
    }
};

exports.generatePaymentQR = async (req, res) => {
    try {
        const { attendanceId, amount } = req.body;
        // Simulate QR generation
        const transactionId = `TXN_${Date.now()}_QR`;
        const qrCode = `upi://pay?pa=kudumbashree@upi&pn=Kudumbashree&am=${amount}&tr=${transactionId}`;
        
        res.status(200).json({ qrCode, transactionId });
    } catch (error) {
        res.status(500).json({ message: 'Error generating QR code', error: error.message });
    }
};
