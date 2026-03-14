const Meeting = require('../models/Meeting');
const geminiService = require('../services/geminiService');

module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log('New client connected for realtime transcription:', socket.id);
        
        let meetingId = null;
        let cumulativeTranscript = '';

        socket.on('startRecording', async (data) => {
            meetingId = data.meetingId;
            cumulativeTranscript = '';
            console.log(`Started recording for meeting ${meetingId}`);
            try {
                await Meeting.update({ processingStatus: 'PROCESSING' }, { where: { id: meetingId } });
            } catch (error) {
                console.error(error);
            }
        });

        socket.on('audioChunk', async (data) => {
            if (!meetingId || !data.audio) return;
            
            try {
                const chunkText = await geminiService.transcribeAudioChunk(data.audio, data.mimeType || 'audio/webm');
                if (chunkText) {
                    cumulativeTranscript += ' ' + chunkText;
                    socket.emit('interimTranscript', { transcript: cumulativeTranscript.trim() });
                }
            } catch (error) {
                console.error('Error processing audio chunk:', error);
            }
        });

        socket.on('stopRecording', async (data) => {
            if (!meetingId) return;
            console.log(`Stopped recording for meeting ${meetingId}, finalizing transcription...`);
            
            socket.emit('processingStatus', { message: 'Generating final summary...' });
            
            try {
                // Generate the final structured summary based on the cumulative transcript
                const finalResult = await geminiService.finalizeAudioTranscription(cumulativeTranscript);
                
                await Meeting.update({ 
                    processingStatus: 'COMPLETED',
                    transcript: cumulativeTranscript.trim(),
                    summary: finalResult.summary,
                }, { where: { id: meetingId } });
                
                socket.emit('finalTranscription', {
                    transcript: cumulativeTranscript.trim(),
                    summary: finalResult.summary
                });
            } catch (error) {
                console.error('Error finalizing transcription:', error);
                await Meeting.update({ processingStatus: 'FAILED' }, { where: { id: meetingId } });
                socket.emit('transcriptionError', { message: 'Failed to generate summary.' });
            }
            
            meetingId = null;
            cumulativeTranscript = '';
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
    });
};
