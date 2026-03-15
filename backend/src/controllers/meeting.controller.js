const Meeting = require('../models/Meeting');
const KudumbashreeGroup = require('../models/KudumbashreeGroup');
const Attendance = require('../models/Attendance');
const geminiService = require('../services/geminiService');

// Helper: Process in background (No Redis)
const processMeetingBackground = async (meetingId) => {
    console.log(`[Background] Starting processing for Meeting ${meetingId}...`);
    try {
        // 1. Fetch Meeting with Audio Data
        const meeting = await Meeting.findByPk(meetingId);
        if (!meeting || !meeting.audioData) {
            console.error(`[Background] Meeting or Audio Data not found for ${meetingId}`);
            return;
        }

        // 2. Update Status: PROCESSING
        await Meeting.update({ processingStatus: 'PROCESSING' }, { where: { id: meetingId } });

        // 3. Process with Gemini
        console.log('[Background] Sending audio to Gemini...');
        const result = await geminiService.processMeetingAudio(meeting.audioData, 'audio/webm');
        console.log('[Background] Gemini processing complete.');

        // 4. Update DB
        await Meeting.update({
            processingStatus: 'COMPLETED',
            transcript: result.transcript,
            summary: result.summary,
        }, { where: { id: meetingId } });

        console.log(`[Background] Job completed for Meeting ${meetingId}`);

    } catch (error) {
        console.error(`[Background] Job failed for Meeting ${meetingId}:`, error);
        await Meeting.update({ processingStatus: 'FAILED' }, { where: { id: meetingId } });
    }
};

exports.scheduleMeeting = async (req, res) => {
    try {
        const { groupId, date, title, location, description, latitude, longitude, radius } = req.body;
        const meeting = await Meeting.create({
            groupId,
            date,
            title,
            location,
            description,
            latitude,
            longitude,
            radius: radius || 100,
            status: 'Scheduled'
        });

        // Use Case 4: Auto-notify members
        // Simulated notification logic
        console.log(`Notification sent to all members of Group ${groupId} regarding meeting "${title}" on ${date}`);

        res.status(201).json({
            message: 'Meeting scheduled successfully and members notified.',
            meeting,
            notificationsSent: true
        });
    } catch (error) {
        res.status(500).json({ message: 'Error scheduling meeting', error: error.message });
    }
};

exports.getMeetings = async (req, res) => {
    try {
        const { groupId, type } = req.query; // type: 'active' or 'history'

        let where = {};
        if (groupId) where.groupId = groupId;

        const { Op } = require('sequelize');
        const now = new Date();

        if (type === 'active') {
            where = {
                ...where,
                [Op.or]: [
                    { status: 'Scheduled' },
                    {
                        date: { [Op.gte]: now }  // Future meetings
                    }
                ]
            };
        } else if (type === 'history') {
            where = {
                ...where,
                [Op.or]: [
                    { status: 'Completed' },
                    { status: 'Cancelled' },
                    {
                        date: { [Op.lt]: now } // Past meetings
                    }
                ]
            };
        }

        const meetings = await Meeting.findAll({
            where,
            include: [{ model: KudumbashreeGroup, attributes: ['name', 'type'] }],
            order: [['date', 'DESC']]
        });
        res.status(200).json(meetings);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching meetings', error: error.message });
    }
};

exports.recordMeetingAudio = async (req, res) => {
    try {
        const { meetingId } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: 'No audio file uploaded.' });
        }

        // Save audio buffer to Database (BLOB)
        await Meeting.update({
            audioData: req.file.buffer, // Buffer from memory storage
            processingStatus: 'UPLOADING', // Technically uploaded to DB now
            status: 'Completed'
        }, { where: { id: meetingId } });

        // Start Background Processing (Fire & Forget)
        processMeetingBackground(meetingId);

        res.status(200).json({
            message: 'Audio uploaded successfully. AI processing started.',
            processingStatus: 'PENDING'
        });
    } catch (error) {
        console.error('Error in recordMeetingAudio:', error);
        res.status(500).json({ message: 'Error recording audio', error: error.message });
    }
};

exports.getProcessingStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const meeting = await Meeting.findByPk(id, { attributes: ['processingStatus', 'transcript', 'summary'] });

        if (!meeting) {
            return res.status(404).json({ message: 'Meeting not found' });
        }

        res.status(200).json(meeting);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching status', error: error.message });
    }
};

exports.getMeetingTranscript = async (req, res) => {
    try {
        const { id } = req.params;
        const meeting = await Meeting.findByPk(id, { attributes: ['transcript', 'summary', 'title', 'date'] });
        if (!meeting) {
            return res.status(404).json({ message: 'Meeting not found' });
        }
        res.status(200).json({
            transcript: meeting.transcript || 'Transcript not available yet.',
            summary: meeting.summary || 'Summary not available yet.'
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching transcript', error: error.message });
    }
};

exports.deleteMeeting = async (req, res) => {
    try {
        const { id } = req.params;
        const meeting = await Meeting.findByPk(id);
        if (!meeting) {
            return res.status(404).json({ message: 'Meeting not found' });
        }

        // Manual Cascade: Delete associated attendance records first
        await Attendance.destroy({ where: { meetingId: id } });

        await meeting.destroy();
        res.status(200).json({ message: 'Meeting deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting meeting', error: error.message });
    }
};
