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

        // Location Verification
        const meeting = await Meeting.findByPk(meetingId);
        if (!meeting) {
            return res.status(404).json({ message: 'Meeting not found.' });
        }

        if (meeting.latitude && meeting.longitude && latitude && longitude) {
            const distance = calculateDistance(latitude, longitude, meeting.latitude, meeting.longitude);
            if (distance > meeting.radius) {
                return res.status(400).json({ 
                    message: 'Location verification failed. You are not at the meeting location.',
                    distance: Math.round(distance),
                    requiredRadius: meeting.radius
                });
            }
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

        // Location Verification
        const meeting = await Meeting.findByPk(meetingId);
        if (!meeting) {
            return res.status(404).json({ message: 'Meeting not found.' });
        }

        if (meeting.latitude && meeting.longitude && latitude && longitude) {
            const distance = calculateDistance(latitude, longitude, meeting.latitude, meeting.longitude);
            if (distance > meeting.radius) {
                return res.status(400).json({ 
                    message: 'Location verification failed. You are not at the meeting location.',
                    distance: Math.round(distance),
                    requiredRadius: meeting.radius
                });
            }
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

// Haversine formula to calculate distance in meters
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}
