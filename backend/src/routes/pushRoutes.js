const express = require('express');
const router = express.Router();
const PushSubscription = require('../models/PushSubscription');
const webpush = require('web-push');

// POST /api/push/subscribe
router.post('/subscribe', async (req, res) => {
    try {
        const { endpoint, keys } = req.body;
        const userId = req.user.id; // from auth middleware

        if (!endpoint || !keys) {
            return res.status(400).json({ error: 'Invalid subscription object' });
        }

        // Add or update the push subscription
        const existing = await PushSubscription.findOne({ where: { user_id: userId, endpoint } });
        if (!existing) {
            await PushSubscription.create({
                user_id: userId,
                endpoint,
                keys_p256dh: keys.p256dh,
                keys_auth: keys.auth
            });
        }

        res.status(201).json({ success: true, message: 'Subscription saved' });
    } catch (error) {
        console.error('Error saving subscription:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/push/vapidPublicKey
router.get('/vapidPublicKey', (req, res) => {
    res.json({ publicKey: process.env.VAPID_PUBLIC_KEY });
});

// GET /api/push/test
router.post('/test', async (req, res) => {
    try {
        const userId = req.user.id;
        const subs = await PushSubscription.findAll({ where: { user_id: userId } });
        
        webpush.setVapidDetails(
            process.env.VAPID_SUBJECT,
            process.env.VAPID_PUBLIC_KEY,
            process.env.VAPID_PRIVATE_KEY
        );

        let count = 0;
        for (const sub of subs) {
            const pushConfig = {
                endpoint: sub.endpoint,
                keys: {
                    auth: sub.keys_auth,
                    p256dh: sub.keys_p256dh
                }
            };
            await webpush.sendNotification(pushConfig, JSON.stringify({
                notification: {
                    title: 'Test Notification',
                    body: 'Push notifications are working!',
                    icon: '/assets/icons/icon-192x192.png'
                }
            }));
            count++;
        }
        res.json({ success: true, sent: count });
    } catch (e) {
        console.error('Test notification failed', e);
        res.status(500).json({ error: e.message });
    }
});

module.exports = router;
