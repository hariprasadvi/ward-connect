const DonationRequest = require('../models/DonationRequest');
const MedicineReminder = require('../models/MedicineReminder');
const HealthRecord = require('../models/HealthRecord');
const User = require('../models/User');
const OpBooking = require('../models/OpBooking');

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

// --- OP Ticket Bookings ---

exports.createOpBooking = async (req, res) => {
    try {
        const { hospital, department, date, timeSlot, patientDetails } = req.body;
        const booking = await OpBooking.create({
            userId: req.user.id,
            hospital,
            department,
            date,
            timeSlot,
            patientDetails
        });
        res.status(201).json(booking);
    } catch (error) {
        console.error('Error creating OP booking:', error);
        res.status(500).json({ message: 'Error creating OP booking', error: error.message });
    }
};

exports.getUserOpBookings = async (req, res) => {
    try {
        const bookings = await OpBooking.findAll({
            where: { userId: req.user.id },
            order: [['createdAt', 'DESC']]
        });
        res.json(bookings);
    } catch (error) {
        console.error('Error fetching OP bookings:', error);
        res.status(500).json({ message: 'Error fetching OP bookings', error: error.message });
    }
};

exports.cancelOpBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const booking = await OpBooking.findOne({ where: { id, userId: req.user.id } });
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        await booking.destroy();
        res.json({ message: 'OP booking cancelled successfully' });
    } catch (error) {
        console.error('Error cancelling OP booking:', error);
        res.status(500).json({ message: 'Error cancelling OP booking', error: error.message });
    }
};

exports.getAllOpBookings = async (req, res) => {
    try {
        const bookings = await OpBooking.findAll({
            include: [{ model: User, attributes: ['name', 'email', 'phone'] }],
            order: [['createdAt', 'DESC']]
        });
        res.json(bookings);
    } catch (error) {
        console.error('Error fetching all OP bookings:', error);
        res.status(500).json({ message: 'Error fetching all OP bookings', error: error.message });
    }
};

exports.updateOpBookingStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, tokenNumber, rejectionReason, timeSlot } = req.body;

        const booking = await OpBooking.findByPk(id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        booking.status = status || booking.status;
        booking.tokenNumber = tokenNumber || booking.tokenNumber;
        booking.rejectionReason = rejectionReason || booking.rejectionReason;
        if (timeSlot) booking.timeSlot = timeSlot;
        booking.healthWorkerId = req.user.id;

        await booking.save();
        res.json(booking);
    } catch (error) {
        console.error('Error updating OP booking status:', error);
        res.status(500).json({ message: 'Error updating status', error: error.message });
    }
};
