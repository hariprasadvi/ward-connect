const webpush = require('web-push');
const fs = require('fs');
const path = require('path');

const vapidKeys = webpush.generateVAPIDKeys();
const envPath = path.join(__dirname, '.env');

let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';

if (!envContent.includes('VAPID_PUBLIC_KEY')) {
    envContent += `\nVAPID_PUBLIC_KEY=${vapidKeys.publicKey}\nVAPID_PRIVATE_KEY=${vapidKeys.privateKey}\nVAPID_SUBJECT=mailto:admin@wardconnect.com\n`;
    fs.writeFileSync(envPath, envContent);
    console.log('VAPID keys generated and added to .env');
} else {
    console.log('VAPID keys already exist in .env');
}
