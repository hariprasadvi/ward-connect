const PushSubscription = require('./src/models/PushSubscription');
const MedicineReminder = require('./src/models/MedicineReminder');

async function test() {
    try {
        const subs = await PushSubscription.findAll();
        console.log(`Found ${subs.length} PushSubscriptions.`);
        if (subs.length > 0) {
            console.log('First sub:', subs[0].endpoint);
        }

        const rems = await MedicineReminder.findAll();
        console.log(`Found ${rems.length} MedicineReminders.`);
        rems.forEach(r => {
            console.log(`- ${r.medicineName} at ${r.scheduledTimes}`);
        });

        const now = new Date();
        const currentTimeString = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
        console.log(`Server current time string: ${currentTimeString}`);
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}

test();
