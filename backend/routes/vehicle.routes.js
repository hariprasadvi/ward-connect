const express = require('express');
const router = express.Router();
const Vehicle = require('../models/vehicle.model');
const Booking = require('../models/booking.model');
const { Op } = require('sequelize');

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
// Note: Simple bounding box or distance check can be added later. For now, returning all available active vehicles.
router.get('/search', async (req, res) => {
    try {
        // Optional: filter by type if provided in query
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
            status: 'Confirmed'
        });

        // Update vehicle availability to false
        vehicle.isAvailable = false;
        await vehicle.save();

        res.status(201).json({ message: 'Booking confirmed', booking });
    } catch (error) {
        res.status(500).json({ message: 'Error booking vehicle', error: error.message });
    }
});

// --- User API: Emergency SOS ---
router.post('/emergency', async (req, res) => {
    try {
        const { userId, latitude, longitude } = req.body;

        // Find nearest available Ambulance or any vehicle if Ambulance not found
        // Simplify: Just find the first available Ambulance
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

module.exports = router;
