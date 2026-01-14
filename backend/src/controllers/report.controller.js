const Loan = require('../models/Loan');
const Meeting = require('../models/Meeting');
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const KudumbashreeProfile = require('../models/KudumbashreeProfile');
const { sequelize } = require('../config/database');
const { Op } = require('sequelize');

exports.getAdminDashboard = async (req, res) => {
    try {
        const { groupId } = req.query;
        const whereGroup = groupId ? { groupId } : {};
        const whereUser = groupId ? { groupId, role: 'Kudumbashree Member' } : { role: 'Kudumbashree Member' };

        const totalMembers = await User.count({ where: whereUser });
        const activeMembers = await User.count({ where: { ...whereUser, is_active: true } }); // Assuming is_active exists or use status

        const totalMeetings = await Meeting.count({ where: whereGroup });
        const upcomingMeetings = await Meeting.count({ 
            where: { 
                ...whereGroup, 
                date: { [Op.gt]: new Date() },
                status: 'Scheduled'
            } 
        });

        const totalLoans = await Loan.count({ where: whereGroup });
        const pendingLoans = await Loan.count({ where: { ...whereGroup, status: 'Pending' } });
        
        // Sums need handling of null
        const totalLoanAmount = await Loan.sum('amount', { where: { ...whereGroup, status: { [Op.ne]: 'Rejected' } } }) || 0;
        const recoveredAmount = await Loan.sum('repaid_amount', { where: whereGroup }) || 0;
        const pendingAmount = totalLoanAmount - recoveredAmount;

        // Attendance Rate (simplified: total present / total expected)
        // Total Expected = (Meetings * Members) - simplified estimation
        const totalAttendance = await Attendance.count({ where: { status: 'Present' } });
        const attendanceRate = totalMeetings > 0 && totalMembers > 0 
            ? Math.round((totalAttendance / (totalMeetings * totalMembers)) * 100) 
            : 0;

        res.status(200).json({
            totalMembers,
            activeMembers,
            totalMeetings,
            upcomingMeetings,
            totalLoans,
            pendingLoans,
            totalLoanAmount,
            recoveredAmount,
            pendingAmount,
            attendanceRate
        });
    } catch (error) {
        res.status(500).json({ message: 'Error generating admin dashboard', error: error.message });
    }
};

exports.getMemberDashboard = async (req, res) => {
    try {
        const userId = req.user.id; // From auth middleware
        const user = await User.findByPk(userId);
        
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Fetch Kudumbashree Profile to get proper Group ID
        const profile = await KudumbashreeProfile.findOne({ where: { userId } });
        const groupId = profile ? profile.groupId : null;

        const whereUser = { userId };

        const meetingsAttended = await Attendance.count({ where: { userId, status: 'Present' } });
        
        // Total meetings for user's group
        let totalMeetings = 0;
        let nextMeeting = null;
        let attendanceRate = 0;

        if (groupId) {
             totalMeetings = await Meeting.count({ where: { groupId } });
             attendanceRate = totalMeetings > 0 ? Math.round((meetingsAttended / totalMeetings) * 100) : 0;
             
             nextMeeting = await Meeting.findOne({
                where: {
                    groupId,
                    date: { [Op.gt]: new Date() }
                },
                order: [['date', 'ASC']],
                limit: 1
            });
        }

        const loansTaken = await Loan.count({ where: whereUser });
        const activeLoans = await Loan.count({ where: { ...whereUser, status: 'Active' } });
        const totalLoanAmount = await Loan.sum('amount', { where: whereUser }) || 0;
        const repaidAmount = await Loan.sum('repaid_amount', { where: whereUser }) || 0;
        const pendingAmount = totalLoanAmount - repaidAmount;

        // Fetch attended meeting IDs
        const attendedMeetings = await Attendance.findAll({
            where: { userId, status: 'Present' },
            attributes: ['meetingId']
        });
        const attendedMeetingIds = attendedMeetings.map(a => a.meetingId);

        // Recent Activities (Mock/Aggregated from tables)
        const recentActivities = []; // Implement aggregation if needed
        
        res.status(200).json({
            user: user, // Sends full user object as interface expects
            stats: {
                meetingsAttended,
                totalMeetings,
                attendanceRate,
                loansTaken,
                activeLoans,
                totalLoanAmount,
                repaidAmount,
                pendingAmount,
                nextMeeting,
                recentActivities,
                attendedMeetingIds // Add this
            }
        });

    } catch (error) {
         res.status(500).json({ message: 'Error generating member dashboard', error: error.message });
    }
};
