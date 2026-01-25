const Queue = require('bull');
const dotenv = require('dotenv');
const { sequelize } = require('../config/database');
const Meeting = require('../models/Meeting');
const geminiService = require('../services/geminiService');

dotenv.config();

const minutesQueue = new Queue('meeting-minutes', process.env.REDIS_URL || 'redis://localhost:6379');

minutesQueue.process(async (job) => {
    const { meetingId } = job.data;
    console.log(`Processing job for Meeting ${meetingId}...`);

    try {
        // 1. Fetch Meeting with Audio Data
        const meeting = await Meeting.findByPk(meetingId);
        if (!meeting || !meeting.audioData) {
            throw new Error('Meeting or Audio Data not found');
        }

        // 2. Update Status: PROCESSING
        await Meeting.update({ processingStatus: 'PROCESSING' }, { where: { id: meetingId } });

        // 3. Process with Gemini (Transcribe + Summarize)
        console.log('Sending audio to Gemini...');
        const result = await geminiService.processMeetingAudio(meeting.audioData, 'audio/webm'); // Assuming webm from frontend
        console.log('Gemini processing complete.');

        // 4. Update DB
        await Meeting.update({ 
            processingStatus: 'COMPLETED',
            transcript: result.transcript,
            summary: result.summary,
            // audioData: null // Optional: clear to save space? User wanted to store in pg admin, so let's keep it.
        }, { where: { id: meetingId } });

        console.log(`Job completed for Meeting ${meetingId}`);
        return { success: true };

    } catch (error) {
        console.error(`Job failed for Meeting ${meetingId}:`, error);
        await Meeting.update({ processingStatus: 'FAILED' }, { where: { id: meetingId } });
        throw error;
    }
});

module.exports = minutesQueue;
