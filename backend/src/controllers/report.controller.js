const Loan = require('../models/Loan');
const Meeting = require('../models/Meeting');
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const KudumbashreeProfile = require('../models/KudumbashreeProfile');
const Notification = require('../models/Notification');
const { sequelize } = require('../config/database');
const { Op } = require('sequelize');
const geminiService = require('../services/geminiService');

exports.getAdminDashboard = async (req, res) => {
    try {
        const { groupId } = req.query;
        const whereGroup = groupId ? { groupId } : {};
        const whereUser = groupId ? { groupId, role: 'Kudumbashree Member' } : { role: 'Kudumbashree Member' };

        const totalMembers = await User.count({ where: whereUser });
        const activeMembers = await User.count({ where: { ...whereUser, is_approved: true } }); 

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
        
        const totalLoanAmount = await Loan.sum('amount', { where: { ...whereGroup, status: { [Op.ne]: 'Rejected' } } }) || 0;
        const recoveredAmount = await Loan.sum('repaid_amount', { where: whereGroup }) || 0;
        const pendingAmount = totalLoanAmount - recoveredAmount;

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
        const userId = req.user.id; 
        const user = await User.findByPk(userId);
        
        if (!user) return res.status(404).json({ message: 'User not found' });

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
        
        const loans = await Loan.findAll({ where: whereUser });
        const totalLoanAmount = loans.reduce((sum, loan) => sum + parseFloat(loan.amount), 0);
        const repaidAmount = loans.reduce((sum, loan) => sum + parseFloat(loan.repaid_amount), 0);
        
        let pendingAmount = 0;
        loans.forEach(loan => {
             const principalOutstanding = parseFloat(loan.amount) - parseFloat(loan.repaid_amount);
             const overdue = parseFloat(loan.overdue_amount || 0);
             pendingAmount += (principalOutstanding > 0 ? principalOutstanding : 0) + overdue;
        });

        const attendedMeetings = await Attendance.findAll({
            where: { userId, status: 'Present' },
            attributes: ['meetingId']
        });
        const attendedMeetingIds = attendedMeetings.map(a => a.meetingId);

        const recentActivities = []; 
        
        res.status(200).json({
            user: user, 
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
                attendedMeetingIds,
                notifications: await getValidNotifications(userId)
            }
        });

    } catch (error) {
         res.status(500).json({ message: 'Error generating member dashboard', error: error.message });
    }
};

exports.generateAiReport = async (req, res) => {
    try {
        const { type, groupId } = req.body; 
        const whereGroup = groupId ? { groupId } : {};

        let data = {};

        if (type === 'Loan') {
            data.loans = await Loan.findAll({
                 where: whereGroup,
                 include: [{ model: User, attributes: ['full_name'] }]
            });
            data.summary = {
                totalLoans: await Loan.count({ where: whereGroup }),
                totalAmount: await Loan.sum('amount', { where: whereGroup }) || 0
            };
        } else if (type === 'Attendance') {
             data.attendance = await Attendance.findAll({
                 where: { ...whereGroup }, 
                 include: [{ model: User, attributes: ['full_name'] }],
                 limit: 50, 
                 order: [['createdAt', 'DESC']]
             });
        } else if (type === 'Financial') {
            const FinancialTransaction = require('../models/FinancialTransaction');
             data.transactions = await FinancialTransaction.findAll({
                 where: whereGroup,
                 limit: 50,
                 order: [['date', 'DESC']]
             });
             data.loans = await Loan.findAll({ attributes: ['amount', 'repaid_amount', 'overdue_amount'], where: whereGroup });
        } else {
             return res.status(400).json({ message: 'Invalid report type' });
        }

        const reportMarkdown = await geminiService.generateReport(data, type);
        res.json({ report: reportMarkdown });

    } catch (error) {
        console.error("AI Report Error:", error);
        res.status(500).json({ message: 'Error generating report', error: error.message });
    }
};

// Helper to filter stale notifications
async function getValidNotifications(userId) {
    try {
        const notifications = await Notification.findAll({
            where: { userId, isRead: false },
            order: [['createdAt', 'DESC']]
        });

        const validNotifications = [];
        const staleNotificationIds = [];

        for (const notif of notifications) {
            if (notif.type === 'payment_reminder') {
                const match = notif.message.match(/Loan #(\d+)/);
                if (match && match[1]) {
                    const loanId = match[1];
                    const loan = await Loan.findByPk(loanId);
                    if (!loan || loan.status === 'Closed' || loan.status === 'Rejected' || (parseFloat(loan.overdue_amount) <= 0 && parseFloat(loan.repaid_amount) >= parseFloat(loan.amount))) {
                        staleNotificationIds.push(notif.id);
                        continue; 
                    }
                }
            }
            validNotifications.push(notif);
        }

        if (staleNotificationIds.length > 0) {
            await Notification.update({ isRead: true }, {
                where: { id: { [Op.in]: staleNotificationIds } }
            });
        }

        return validNotifications;
    } catch (e) {
        console.error("Error filtering notifications:", e);
        return [];
    }
}
