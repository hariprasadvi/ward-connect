const { sequelize } = require('./src/config/database');
const Meeting = require('./src/models/Meeting');
const meetingController = require('./src/controllers/meeting.controller');

async function test() {
    try {
        await sequelize.authenticate();
        console.log('DB Connected');

        // Create a dummy meeting
        const meeting = await Meeting.create({
            groupId: 1,
            date: new Date(),
            title: 'NoRedis Debug Meeting ' + Date.now(),
            radius: 100,
            status: 'Scheduled',
            processingStatus: 'PENDING'
        });

        console.log('Created meeting:', meeting.id);

        // Simulate Upload
        await Meeting.update({
            audioData: Buffer.from('dummy audio data'),
            processingStatus: 'UPLOADING',
            status: 'Completed'
        }, { where: { id: meeting.id } });

        console.log('Simulating Controller Call...');

        // We can't easily call the unexported helper, so we have to verify by 
        // 1. Observing the app behaviour via manual test OR
        // 2. Exporting the helper for testing (not ideal to change code just for test)
        // 3. Just verifying the flow by trusting the code edit.

        // However, we CAN call recordMeetingAudio if we mock req/res
        const req = {
            body: { meetingId: meeting.id },
            file: { buffer: Buffer.from('dummy audio') }
        };
        const res = {
            status: (code) => ({
                json: (data) => console.log(`Response [${code}]:`, data)
            })
        };

        await meetingController.recordMeetingAudio(req, res);

        // Poll for status change
        let attempts = 0;
        const interval = setInterval(async () => {
            attempts++;
            const m = await Meeting.findByPk(meeting.id);
            console.log(`[${attempts}] Status: ${m.processingStatus}`);

            if (m.processingStatus === 'COMPLETED' || m.processingStatus === 'FAILED') {
                clearInterval(interval);
                console.log('Final Status:', m.processingStatus);
                process.exit(0);
            }
            if (attempts > 10) {
                clearInterval(interval);
                console.log('Timeout waiting for background process.');
                process.exit(1);
            }
        }, 2000);

    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

test();
