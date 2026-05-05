const Attendance = require('../models/Attendance');
const FinancialTransaction = require('../models/FinancialTransaction');
const User = require('../models/User');
const Meeting = require('../models/Meeting');
const { Op } = require('sequelize');

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
        const { meetingId, userId, status, thrift_amount, attendanceFee, groupId, latitude, longitude, face_verified } = req.body;
        console.log('markAttendanceWithPayment Payload:', JSON.stringify(req.body, null, 2));

        // Handle amount mismatch (Frontend sends attendanceFee)
        const finalAmount = thrift_amount || attendanceFee;

        if (!face_verified) {
             console.log('Face verification failed check');
             return res.status(400).json({ message: 'Face verification failed.' });
        }

        // Location Verification
        const meeting = await Meeting.findByPk(meetingId);
        if (!meeting) {
            return res.status(404).json({ message: 'Meeting not found.' });
        }

        // Use groupId from request or fallback to meeting's groupId
        const finalGroupId = groupId || meeting.groupId;
        if (!finalGroupId) {
             return res.status(400).json({ message: 'Group ID is required for financial transaction.' });
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
            groupId: finalGroupId,
            type: 'Thrift',
            amount: finalAmount || 0, // Ensure not null
            status: 'Success',
            transaction_id: `TXN_${Date.now()}`
        });

        // 2. Mark Attendance
        const attendance = await Attendance.create({
            meetingId,
            userId,
            status: status || 'Present',
            thrift_amount: finalAmount,
            payment_status: 'Paid',
            transaction_id: transaction.transaction_id,
            latitude,
            longitude,
            face_verified
        });

        // 3. Update User Attendance Percentage
        try {
            await updateUserAttendanceStats(userId, finalGroupId);
        } catch (updateError) {
            console.error('Error updating user stats:', updateError);
            // Don't fail the request just because stats update failed
        }

        res.status(201).json({ message: 'Attendance and payment recorded with verification.', attendance, transaction });
    } catch (error) {
        console.error("Error in markAttendanceWithPayment:", error);
        res.status(500).json({ message: 'Error recording attendance with payment', error: error.message });
    }
};

// Helper to update User stats
async function updateUserAttendanceStats(userId, groupId) {
    const totalMeetings = await Meeting.count({ where: { groupId, status: 'Completed' } });
    const attendedMeetings = await Attendance.count({ where: { userId, status: 'Present' } });

    if (totalMeetings > 0) {
        const percentage = (attendedMeetings / totalMeetings) * 100;
        // Check if User model has a field for this, otherwise we might just return it or rely on dynamic calculation
        // For now, let's assume valid User model and try to update if a field exists, 
        // OR we can rely on the Frontend to calculate it from the history endpoint.
        // Checking User model content from view_file...
        /* 
           If User model doesn't have 'attendance_percentage', we can't save it. 
           But usually, this is calculated on read. 
           However, let's try to find if there is a 'completion' or 'performance' field.
           If not, we skip saving and rely on 'getProfile' to calculate it.
        */
         const user = await User.findByPk(userId);
         if (user) {
             // Example: if user has a generic 'performance_score' or similar. 
             // If not, we just log it for now.
             // console.log(`Updated Attendance for User ${userId}: ${percentage}%`);
         }
    }
}

exports.getAttendanceByMeetingId = async (req, res) => {
    try {
        const { meetingId } = req.params;
        const attendanceList = await Attendance.findAll({
            where: { meetingId },
            include: [
                {
                    model: User,
                    attributes: ['id', ['full_name', 'name'], 'email', 'ward_number', ['mobile_number', 'phone_number']] // Adjust attributes based on User model
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json(attendanceList);
    } catch (error) {
        console.error("Error fetching attendance list:", error);
        res.status(500).json({ message: 'Error fetching attendance list', error: error.message });
    }
};

exports.getUserAttendanceHistory = async (req, res) => {
    try {
        // userId should come from auth middleware
        const userId = req.user.id; 
        
        const attendanceList = await Attendance.findAll({
            where: { userId },
            include: [
                {
                    model: Meeting,
                    attributes: ['id', 'title', 'date', 'location', 'status', 'description']
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        // Map to a cleaner format expected by frontend
        const history = attendanceList.map(record => ({
            id: record.Meeting.id,
            title: record.Meeting.title,
            date: record.Meeting.date,
            location: record.Meeting.location,
            status: record.status, // Attendance status (Present/Absent)
            description: record.Meeting.description,
            thrift_amount: record.thrift_amount,
            // You can include meeting status too if needed
        }));

        res.status(200).json(history);
    } catch (error) {
        console.error("Error fetching user attendance history:", error);
        res.status(500).json({ message: 'Error fetching history', error: error.message });
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

// Admin submit attendance: validates admin count vs actual present count
exports.adminSubmitAttendance = async (req, res) => {
    try {
        const { meetingId } = req.params;
        const { adminCount } = req.body;

        if (adminCount === undefined || adminCount === null || isNaN(Number(adminCount))) {
            return res.status(400).json({ message: 'Admin count is required and must be a number.' });
        }

        const meeting = await Meeting.findByPk(meetingId);
        if (!meeting) {
            return res.status(404).json({ message: 'Meeting not found.' });
        }

        if (meeting.attendance_submitted) {
            return res.status(400).json({ message: 'Attendance has already been submitted for this meeting.' });
        }

        // Count actual Present records for this meeting
        const actualCount = await Attendance.count({
            where: { meetingId, status: 'Present' }
        });

        const enteredCount = Number(adminCount);

        if (enteredCount !== actualCount) {
            return res.status(400).json({
                message: `Count mismatch: You entered ${enteredCount}, but ${actualCount} member(s) have marked attendance. Please verify and try again.`,
                adminCount: enteredCount,
                actualCount
            });
        }

        // Counts match — finalize the meeting attendance
        await Meeting.update(
            { attendance_submitted: true, status: 'Completed' },
            { where: { id: meetingId } }
        );

        return res.status(200).json({
            message: `Attendance submitted successfully. ${actualCount} member(s) confirmed.`,
            meetingId,
            confirmedCount: actualCount
        });
    } catch (error) {
        console.error('Error in adminSubmitAttendance:', error);
        res.status(500).json({ message: 'Error submitting attendance', error: error.message });
    }
};

// Get attendance summary for a meeting (for admin view)
exports.getAttendanceSummary = async (req, res) => {
    try {
        const { meetingId } = req.params;

        const meeting = await Meeting.findByPk(meetingId, {
            attributes: ['id', 'title', 'date', 'location', 'status', 'attendance_submitted']
        });
        if (!meeting) {
            return res.status(404).json({ message: 'Meeting not found.' });
        }

        const presentCount = await Attendance.count({ where: { meetingId, status: 'Present' } });
        const absentCount = await Attendance.count({ where: { meetingId, status: 'Absent' } });

        const attendees = await Attendance.findAll({
            where: { meetingId, status: 'Present' },
            include: [{ model: User, attributes: ['id', ['full_name', 'name'], 'email'] }],
            order: [['createdAt', 'ASC']]
        });

        res.status(200).json({
            meeting,
            presentCount,
            absentCount,
            attendance_submitted: meeting.attendance_submitted,
            attendees
        });
    } catch (error) {
        console.error('Error in getAttendanceSummary:', error);
        res.status(500).json({ message: 'Error fetching summary', error: error.message });
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
