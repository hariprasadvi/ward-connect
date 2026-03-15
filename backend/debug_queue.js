const { sequelize } = require('./src/config/database');
const Meeting = require('./src/models/Meeting');
const minutesQueue = require('./src/queues/minutesQueue');

// Add listeners
minutesQueue.on('error', (error) => {
    console.log('QUEUE ERROR:', error);
});
minutesQueue.on('waiting', (jobId) => {
    console.log('Job Waiting:', jobId);
});
minutesQueue.on('active', (job) => {
    console.log('Job Active:', job.id);
});
minutesQueue.on('stalled', (job) => {
    console.log('Job Stalled:', job.id);
});
minutesQueue.on('completed', (job, result) => {
    console.log('Job Completed:', job.id, result);
});
minutesQueue.on('failed', (job, err) => {
    console.log('Job Failed:', job.id, err);
});

async function test() {
    try {
        await sequelize.authenticate();
        console.log('DB Connected');

        // Create a dummy meeting
        const meeting = await Meeting.create({
            groupId: 1,
            date: new Date(),
            title: 'Debug Meeting ' + Date.now(),
            radius: 100,
            status: 'Scheduled',
            processingStatus: 'PENDING'
        });

        console.log('Created meeting:', meeting.id);

        await Meeting.update({
            audioData: Buffer.from('dummy data'),
            processingStatus: 'UPLOADING'
        }, { where: { id: meeting.id } });

        console.log('Adding to queue...');
        const job = await minutesQueue.add({ meetingId: meeting.id });
        console.log('Job added with ID:', job.id);

        // Poll for status change
        let attempts = 0;
        const interval = setInterval(async () => {
            attempts++;
            const m = await Meeting.findByPk(meeting.id);
            console.log(`[${attempts}] Status: ${m.processingStatus}`);

            if (m.processingStatus === 'COMPLETED' || m.processingStatus === 'FAILED') {
                clearInterval(interval);
                console.log('Final Status:', m.processingStatus);
                // Allow some time for queue events to fire
                setTimeout(() => process.exit(0), 1000);
            }
            if (attempts > 10) {
                clearInterval(interval);
                console.log('Timeout waiting for queue.');
                process.exit(1);
            }
        }, 2000);

    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

test();
