const CivicRequest = require('../models/CivicRequest');

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
        const requests = await CivicRequest.findAll({
            where: { userId },
            order: [['createdAt', 'DESC']]
        });
        res.json(requests);
    } catch (error) {
        console.error('Error fetching civic requests:', error);
        res.status(500).json({ message: 'Error fetching civic requests' });
    }
};

module.exports = { createRequest, getRequests };
