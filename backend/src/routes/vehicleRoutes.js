const express = require('express');
const router = express.Router();
const Vehicle = require('../models/vehicle.model');
const User = require('../models/User'); // Add User import at top of file
const Booking = require('../models/booking.model');

// --- Owner API: Add Vehicle ---
router.post('/add', async (req, res) => {
    try {
        const { ownerId, registrationNumber, type, driverName, contactNumber, latitude, longitude } = req.body;
        const vehicle = await Vehicle.create({
            ownerId,
            registrationNumber,
            type,
            driverName,
            contactNumber,
            latitude,
            longitude
        });
        res.status(201).json({ message: 'Vehicle added successfully', vehicle });
    } catch (error) {
        console.error('Error adding vehicle:', error);
        res.status(500).json({ message: 'Error adding vehicle', error: error.message });
    }
});

// --- Owner API: Get My Vehicles ---
router.get('/my-vehicles/:ownerId', async (req, res) => {
    try {
        const { ownerId } = req.params;
        const vehicles = await Vehicle.findAll({ where: { ownerId } });
        res.status(200).json(vehicles);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching vehicles', error: error.message });
    }
});

// --- User API: Search Nearby Vehicles ---
router.get('/search', async (req, res) => {
    try {
        const { type } = req.query;
        const whereClause = { status: 'Active', isAvailable: true };
        if (type) {
            whereClause.type = type;
        }

        const vehicles = await Vehicle.findAll({ where: whereClause });
        res.status(200).json(vehicles);
    } catch (error) {
        res.status(500).json({ message: 'Error searching vehicles', error: error.message });
    }
});

// --- User API: Book Vehicle ---
router.post('/book', async (req, res) => {
    try {
        const { userId, vehicleId, source, destination, bookingType } = req.body;

        // Check vehicle availability
        const vehicle = await Vehicle.findByPk(vehicleId);
        if (!vehicle || !vehicle.isAvailable) {
            return res.status(400).json({ message: 'Vehicle not available' });
        }

        const booking = await Booking.create({
            userId,
            vehicleId,
            source,
            destination,
            bookingType,
            status: 'Pending' // Start as Pending waiting for owner approval
        });

        // NOTE: We do NOT set vehicle.isAvailable = false yet. 
        // We wait for owner acceptance/active ride to do that, or maybe just leave it?
        // For this flow, let's keep it simple: vehicle shows as available until "Accepted"?
        // Or if it's "Pending", maybe it shouldn't be bookable by others?
        // Let's set it unavailable to prevent double booking attempts for now.
        vehicle.isAvailable = false;
        await vehicle.save();

        res.status(201).json({ message: 'Booking request sent', booking });
    } catch (error) {
        res.status(500).json({ message: 'Error booking vehicle', error: error.message });
    }
});

// --- Owner API: Get Booking Requests ---
router.get('/requests/:ownerId', async (req, res) => {
    try {
        const { ownerId } = req.params;

        // Find all bookings for vehicles owned by this owner with status 'Pending'
        // We need to join Booking with Vehicle to check ownerId
        const bookings = await Booking.findAll({
            include: [
                {
                    model: Vehicle,
                    where: { ownerId },
                    attributes: ['registrationNumber', 'type']
                },
                {
                    model: User,
                    attributes: ['full_name', 'mobile_number', 'ward_number'] // Fetch user details
                }
            ],
            where: {
                status: ['Pending', 'Confirmed']
            },
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json(bookings);
    } catch (error) {
        console.error('Error fetching requests:', error);
        res.status(500).json({ message: 'Error fetching requests', error: error.message });
    }
});

// --- Owner API: Respond to Booking ---
router.post('/respond', async (req, res) => {
    try {
        const { bookingId, status, amount } = req.body; // status: 'Confirmed' (Accepted) or 'Cancelled' (Declined)

        const booking = await Booking.findByPk(bookingId);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        booking.status = status;
        if (status === 'Confirmed' && amount) {
            booking.amount = amount;
        }
        await booking.save();

        // If declined (Cancelled), make vehicle available again
        if (status === 'Cancelled') {
            const vehicle = await Vehicle.findByPk(booking.vehicleId);
            if (vehicle) {
                vehicle.isAvailable = true;
                await vehicle.save();
            }
        }

        res.status(200).json({ message: `Booking ${status}`, booking });
    } catch (error) {
        console.error('Error responding to booking:', error);
        res.status(500).json({ message: 'Error responding to booking', error: error.message });
    }
});

// --- History API: User ---
router.get('/history/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const bookings = await Booking.findAll({
            where: { userId },
            include: [{
                model: Vehicle,
                attributes: ['registrationNumber', 'type', 'driverName', 'contactNumber']
            }],
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json(bookings);
    } catch (error) {
        console.error('Error fetching user history:', error);
        res.status(500).json({ message: 'Error fetching history', error: error.message });
    }
});

// --- History API: Owner ---
router.get('/history/owner/:ownerId', async (req, res) => {
    try {
        const { ownerId } = req.params;
        // Find bookings for vehicles owned by this owner
        const bookings = await Booking.findAll({
            include: [
                {
                    model: Vehicle,
                    where: { ownerId },
                    attributes: ['registrationNumber', 'type']
                },
                {
                    model: User,
                    attributes: ['full_name', 'mobile_number']
                }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json(bookings);
    } catch (error) {
        console.error('Error fetching owner history:', error);
        res.status(500).json({ message: 'Error fetching history', error: error.message });
    }
});

// --- Owner API: Update Location ---
router.put('/update-location/:vehicleId', async (req, res) => {
    try {
        const { vehicleId } = req.params;
        const { latitude, longitude } = req.body;

        const vehicle = await Vehicle.findByPk(vehicleId);
        if (!vehicle) {
            return res.status(404).json({ message: 'Vehicle not found' });
        }

        vehicle.latitude = latitude;
        vehicle.longitude = longitude;
        await vehicle.save();

        res.status(200).json({ message: 'Location updated successfully', vehicle });
    } catch (error) {
        console.error('Error updating location:', error);
        res.status(500).json({ message: 'Error updating location', error: error.message });
    }
});

// --- User API: Get Booking Status ---
router.get('/booking/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const booking = await Booking.findByPk(id);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        res.status(200).json(booking);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching booking status', error: error.message });
    }
});

// --- User API: Emergency SOS ---
router.post('/emergency', async (req, res) => {
    try {
        const { userId, latitude, longitude } = req.body;

        // Find nearest available Ambulance order by simple finding for now
        let vehicle = await Vehicle.findOne({
            where: {
                type: 'Ambulance',
                status: 'Active',
                isAvailable: true
            }
        });

        if (!vehicle) {
            // Fallback to any active vehicle
            vehicle = await Vehicle.findOne({
                where: {
                    status: 'Active',
                    isAvailable: true
                }
            });
        }

        if (!vehicle) {
            return res.status(404).json({ message: 'No vehicles available for emergency!' });
        }

        const booking = await Booking.create({
            userId,
            vehicleId: vehicle.id,
            source: `Lat: ${latitude}, Lng: ${longitude}`,
            destination: 'Nearest Hospital',
            bookingType: 'Emergency',
            status: 'Confirmed'
        });

        // Update vehicle availability
        vehicle.isAvailable = false;
        await vehicle.save();

        res.status(200).json({ message: 'Emergency vehicle dispatched!', vehicle, booking });
    } catch (error) {
        res.status(500).json({ message: 'Error processing emergency request', error: error.message });
    }
});

// --- Owner API: Update Availability ---
router.put('/:vehicleId/availability', async (req, res) => {
    try {
        const { vehicleId } = req.params;
        const { isAvailable } = req.body;

        console.log(`Updating availability for ${vehicleId} to ${isAvailable}`);

        const vehicle = await Vehicle.findByPk(vehicleId);
        if (!vehicle) {
            return res.status(404).json({ message: 'Vehicle not found' });
        }

        vehicle.isAvailable = isAvailable;
        await vehicle.save();

        res.status(200).json({ message: 'Availability updated', vehicle });
    } catch (error) {
        console.error('Error updating availability', error);
        res.status(500).json({ message: 'Error updating availability', error: error.message });
    }
});

// --- Owner API: Delete Vehicle ---
router.delete('/delete/:vehicleId', async (req, res) => {
    try {
        const { vehicleId } = req.params;
        const vehicle = await Vehicle.findByPk(vehicleId);

        if (!vehicle) {
            return res.status(404).json({ message: 'Vehicle not found' });
        }

        // Manually delete related bookings first to avoid constraint errors
        await Booking.destroy({ where: { vehicleId } });

        await vehicle.destroy();
        res.status(200).json({ message: 'Vehicle deleted successfully' });
    } catch (error) {
        console.error('Error deleting vehicle:', error);
        res.status(500).json({ message: 'Error deleting vehicle', error: error.message });
    }
});

// --- User API: Rate Vehicle ---
router.post('/rate', async (req, res) => {
    try {
        const { bookingId, rating } = req.body;
        const booking = await Booking.findByPk(bookingId);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        const vehicle = await Vehicle.findByPk(booking.vehicleId);
        if (!vehicle) {
            return res.status(404).json({ message: 'Vehicle not found' });
        }

        // Calculate new average
        const currentTotal = vehicle.averageRating * vehicle.totalRatings;
        vehicle.totalRatings += 1;
        vehicle.averageRating = (currentTotal + rating) / vehicle.totalRatings;

        await vehicle.save();

        // Mark booking as rated (optional flag if needed, or just rely on UI state)
        // For now, let's assume UI handles "Already Rated" check locally or we add a flag later.

        res.status(200).json({ message: 'Rating submitted', vehicle });
    } catch (error) {
        console.error('Error submitting rating:', error);
        res.status(500).json({ message: 'Error submitting rating', error: error.message });
    }
});

module.exports = router;
