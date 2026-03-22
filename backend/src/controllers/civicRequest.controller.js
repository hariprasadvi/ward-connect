const CivicRequest = require('../models/CivicRequest');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { Op } = require('sequelize');

const createRequest = async (req, res) => {
    try {
        const { title, description, location, mediaUrl } = req.body;
        console.log('Incoming Civic Request:', { title, location, mediaUrlLength: mediaUrl?.length });

        if (!req.user || !req.user.id) {
            console.error('User not authenticated in controller');
            return res.status(401).json({ message: 'User verification failed' });
        }

        const userId = req.user.id;

        if (!title || !description || !location) {
            return res.status(400).json({ message: 'Title, description and location are required' });
        }

        const request = await CivicRequest.create({
            userId,
            title,
            description,
            location,
            mediaUrl,
            status: 'Pending'
        });

        // Notify Admins and Ward Members about the new complaint
        try {
            const admins = await User.findAll({
                where: {
                    role: {
                        [Op.in]: ['Panchayat Admin', 'Ward Member']
                    }
                }
            });

            const notifications = admins.map(admin => ({
                userId: admin.id,
                type: 'alert',
                message: `New civic complaint filed: ${title} at ${location}`
            }));

            if (notifications.length > 0) {
                await Notification.bulkCreate(notifications);
            }
        } catch (notifErr) {
            console.error('Failed to send notification to admins:', notifErr);
        }

        console.log('Civic Request Created successfully:', request.id);
        res.status(201).json({ message: 'Civic request submitted successfully', request });
    } catch (error) {
        console.error('Error creating civic request:', error);
        res.status(500).json({ message: 'Error creating civic request', error: error.message });
    }
};

const getRequests = async (req, res) => {
    try {
        const userId = req.user.id;
        const role = req.user.role;
        let whereClause = {};

        // If Citizen, only fetch their own requests
        // If Panchayat Admin or Ward Member, fetch all requests
        if (role === 'Citizen') {
            whereClause = { userId };
        }

        const requests = await CivicRequest.findAll({
            where: whereClause,
            order: [['createdAt', 'DESC']],
            include: [{
                model: User,
                attributes: ['id', 'full_name', 'mobile_number', 'house_number', 'ward_number']
            }]
        });
        res.json(requests);
    } catch (error) {
        console.error('Error fetching civic requests:', error);
        res.status(500).json({ message: 'Error fetching civic requests' });
    }
};

const updateRequestStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, adminResponse } = req.body;

        const request = await CivicRequest.findByPk(id);

        if (!request) {
            return res.status(404).json({ message: 'Civic request not found' });
        }

        request.status = status || request.status;
        request.adminResponse = adminResponse !== undefined ? adminResponse : request.adminResponse;

        await request.save();

        // Notify the Citizen about the admin update
        try {
            await Notification.create({
                userId: request.userId,
                type: 'info',
                message: `Your civic complaint "${request.title}" was updated by admin. Status: ${request.status}.`
            });
        } catch (notifErr) {
            console.error('Failed to notify citizen:', notifErr);
        }

        res.json({ message: 'Request updated successfully', request });
    } catch (error) {
        console.error('Error updating civic request:', error);
        res.status(500).json({ message: 'Error updating civic request', error: error.message });
    }
};

const getNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const notifications = await Notification.findAll({
            where: { userId },
            order: [['createdAt', 'DESC']],
            limit: 20
        });

        res.json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ message: 'Error fetching notifications' });
    }
};

const markNotificationsAsRead = async (req, res) => {
    try {
        const userId = req.user.id;
        await Notification.update({ isRead: true }, { where: { userId, isRead: false } });
        res.json({ message: 'Notifications marked as read' });
    } catch (error) {
        console.error('Error marking notifications as read:', error);
        res.status(500).json({ message: 'Error updating notifications' });
    }
};

module.exports = { createRequest, getRequests, updateRequestStatus, getNotifications, markNotificationsAsRead };
