const Meeting = require('../models/Meeting');
const KudumbashreeGroup = require('../models/KudumbashreeGroup');

exports.scheduleMeeting = async (req, res) => {
    try {
        const { groupId, date, title, location, description } = req.body;
        const meeting = await Meeting.create({
            groupId,
            date,
            title,
            location,
            description,
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
        const { groupId } = req.query; // Admin might want all, Members only their group
        const where = groupId ? { groupId } : {};
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
        // In a real app, we'd handle file upload (e.g. to S3)
        // Here we simulate saving a URL
        const audioUrl = req.file ? `/uploads/audio/${req.file.filename}` : 'simulated_audio_url.mp3';
        
        // Simulate AI Voice-to-Text and Summarization
        const transcript = "Meeting started at 10 AM. Discussions included loan approvals for 3 members and planning for the upcoming health camp. All members agreed to contribute 100 Rs for the camp.";
        const summary = "Key Decisions: 1. Loan approved for 3 members. 2. Health camp planning initiated. 3. Contribution of 100 Rs per member agreed.";

        await Meeting.update({ 
            audio_url: audioUrl, 
            transcript: transcript,
            summary: summary,
            status: 'Completed' 
        }, { where: { id: meetingId } });
        
        res.status(200).json({ 
            message: 'Audio recorded, transcript generated, and summary created.', 
            audioUrl,
            transcript,
            summary
        });
    } catch (error) {
        res.status(500).json({ message: 'Error recording audio', error: error.message });
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
