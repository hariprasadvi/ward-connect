const DonationRequest = require('../models/DonationRequest');
const MedicineReminder = require('../models/MedicineReminder');
const HealthRecord = require('../models/HealthRecord');
const User = require('../models/User');

exports.createDonationRequest = async (req, res) => {
    try {
        const { patientName, bloodGroup, hospitalLocation, contactNumber, urgencyLevel, requiredDate, description } = req.body;
        const request = await DonationRequest.create({
            userId: req.user.id,
            patientName,
            bloodGroup,
            hospitalLocation,
            contactNumber,
            urgencyLevel,
            requiredDate,
            description
        });
        res.status(201).json(request);
    } catch (error) {
        console.error('Error creating donation request:', error);
        res.status(500).json({ message: 'Error creating donation request', error: error.message });
    }
};

exports.getAllDonationRequests = async (req, res) => {
    try {
        // Can add filtering logic here (by bloodGroup, location)
        const { bloodGroup, location } = req.query;
        const whereClause = { status: 'Pending' };

        if (bloodGroup) whereClause.bloodGroup = bloodGroup;
        // Simple substring match for location if needed, or exact match
        if (location) whereClause.hospitalLocation = location;

        const requests = await DonationRequest.findAll({
            where: whereClause,
            include: [{ model: User, attributes: ['name', 'email'] }],
            order: [['createdAt', 'DESC']]
        });
        res.json(requests);
    } catch (error) {
        console.error('Error fetching donation requests:', error);
        res.status(500).json({ message: 'Error fetching donation requests' });
    }
};

exports.getUserDonationRequests = async (req, res) => {
    try {
        const requests = await DonationRequest.findAll({
            where: { userId: req.user.id },
            order: [['createdAt', 'DESC']]
        });
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user requests' });
    }
};

// --- Medicine Reminders ---

exports.addMedicineReminder = async (req, res) => {
    try {
        const { medicineName, frequency, scheduledTimes, startDate, endDate, instructions } = req.body;
        const reminder = await MedicineReminder.create({
            userId: req.user.id,
            medicineName,
            frequency,
            scheduledTimes,
            startDate,
            endDate,
            instructions
        });
        res.status(201).json(reminder);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error adding medicine reminder' });
    }
};

exports.getMedicineReminders = async (req, res) => {
    try {
        const reminders = await MedicineReminder.findAll({
            where: { userId: req.user.id },
            order: [['createdAt', 'DESC']]
        });
        res.json(reminders);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching reminders' });
    }
};

exports.deleteMedicineReminder = async (req, res) => {
    try {
        const { id } = req.params;
        await MedicineReminder.destroy({ where: { id, userId: req.user.id } });
        res.json({ message: 'Reminder deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting reminder' });
    }
};

// --- Health Records ---

exports.addHealthRecord = async (req, res) => {
    try {
        const { title, recordDate, doctorName, hospitalName, category, description, fileUrl } = req.body;
        const record = await HealthRecord.create({
            userId: req.user.id,
            title,
            recordDate,
            doctorName,
            hospitalName,
            category,
            description,
            fileUrl
        });
        res.status(201).json(record);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error adding health record' });
    }
};

exports.getHealthRecords = async (req, res) => {
    try {
        const records = await HealthRecord.findAll({
            where: { userId: req.user.id },
            order: [['recordDate', 'DESC']]
        });
        res.json(records);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching health records' });
    }
};
