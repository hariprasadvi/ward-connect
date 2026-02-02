const Bill = require('../models/Bill');
const { Op } = require('sequelize');

const getBills = async (req, res) => {
    try {
        const userId = req.user.id;

        // Auto-seed for demo purposes if no bills exist
        const count = await Bill.count({ where: { userId } });
        if (count === 0) {
            await seedMethod(userId);
        }

        const bills = await Bill.findAll({
            where: { userId },
            order: [['dueDate', 'ASC']]
        });

        res.json(bills);
    } catch (error) {
        console.error('Error fetching bills:', error);
        res.status(500).json({ message: 'Error fetching bills' });
    }
};

const payBill = async (req, res) => {
    try {
        const userId = req.user.id;
        const billId = req.params.id;

        let bill = await Bill.findOne({ where: { id: billId, userId } });

        // If it's a demo bill (ID doesn't exist), just return success
        if (!bill) {
            // Check if it looks like a valid ID request
            return res.json({ message: 'Bill paid successfully (Demo)', bill: { id: billId, status: 'Paid' } });
        }

        if (bill.status === 'Paid') {
            return res.status(400).json({ message: 'Bill is already paid' });
        }

        bill.status = 'Paid';
        bill.paymentDate = new Date();
        await bill.save();

        res.json({ message: 'Bill paid successfully', bill });
    } catch (error) {
        console.error('Error paying bill:', error);
        res.status(500).json({ message: 'Error processing payment' });
    }
};

// Helper seeding function
const seedMethod = async (userId) => {
    const types = ['Electricity', 'Water', 'Gas'];
    const fakeBills = [];

    // Add pending bills
    types.forEach(type => {
        fakeBills.push({
            userId,
            billType: type,
            consumerNumber: Math.random().toString().slice(2, 12),
            amount: (Math.random() * 1000 + 100).toFixed(2),
            dueDate: new Date(new Date().setDate(new Date().getDate() + Math.floor(Math.random() * 30))), // Next 30 days
            status: 'Pending'
        });
    });

    // Add one overdue bill
    fakeBills.push({
        userId,
        billType: 'Electricity',
        consumerNumber: Math.random().toString().slice(2, 12),
        amount: (Math.random() * 500 + 100).toFixed(2),
        dueDate: new Date(new Date().setDate(new Date().getDate() - 5)), // 5 days ago
        status: 'Overdue'
    });

    await Bill.bulkCreate(fakeBills);
};

const fetchByConsumer = async (req, res) => {
    try {
        const { consumerNumber, billType } = req.body;

        if (!consumerNumber) {
            return res.status(400).json({ message: 'Consumer number is required' });
        }

        // Demo Mode: If the consumer number is '1234567890123' (demo), return a fake bill if none exists
        if (consumerNumber === '1234567890123') {
            return res.json({
                id: 99999,
                billType: billType || 'Electricity',
                consumerNumber: '1234567890123',
                amount: 750.50,
                dueDate: new Date(),
                status: 'Pending'
            });
        }

        const whereClause = {
            consumerNumber,
            status: { [Op.ne]: 'Paid' }
        };
        if (billType) {
            whereClause.billType = billType;
        }

        const bill = await Bill.findOne({
            where: whereClause
        });

        if (!bill) {
            // For Demo Purposes: If no DB record, generate a fake one so the user can see the flow
            return res.json({
                id: Math.floor(Math.random() * 10000),
                billType: billType || 'Electricity',
                consumerNumber: consumerNumber,
                amount: (Math.random() * 2000 + 100).toFixed(2),
                dueDate: new Date(),
                status: 'Pending',
                isDemo: true // Flag to handle payment differently if needed
            });
        }

        res.json(bill);

    } catch (error) {
        console.error('Error searching bill:', error);
        res.status(500).json({ message: 'Error searching bill' });
    }
}

const Razorpay = require('razorpay');
const crypto = require('crypto');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

const createOrder = async (req, res) => {
    try {
        const { amount, currency = 'INR' } = req.body;

        const options = {
            amount: Math.round(amount * 100), // amount in paise
            currency,
            receipt: `receipt_${Date.now()}`
        };

        const order = await razorpay.orders.create(options);
        res.json(order);
    } catch (error) {
        console.error('Razorpay Error:', error);
        res.status(500).json({ message: 'Error creating order' });
    }
};

const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, billId, isDemo, amount, consumerNumber, billType, billData } = req.body;
        const userId = req.user.id;

        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        if (expectedSignature === razorpay_signature) {

            let bill;

            if (isDemo) {
                // For demo bills, we create a REAL record now that it is paid
                bill = await Bill.create({
                    userId,
                    billType: billType || 'Electricity',
                    consumerNumber: consumerNumber || 'DEMO-CONSUMER',
                    amount: amount || 0,
                    dueDate: new Date(),
                    status: 'Paid',
                    paymentDate: new Date(),
                    details: billData
                });
            } else if (billId) {
                // Update existing bill
                bill = await Bill.findOne({ where: { id: billId, userId } });
                if (bill) {
                    bill.status = 'Paid';
                    bill.paymentDate = new Date();
                    bill.details = billData;
                    await bill.save();
                }
            }

            res.json({
                message: 'Payment verified successfully',
                bill: bill // Return the bill details for PDF generation
            });

        } else {
            res.status(400).json({ message: 'Invalid payment signature' });
        }
    } catch (error) {
        console.error('Verify Error:', error);
        res.status(500).json({ message: 'Error verifying payment' });
    }
};

module.exports = { getBills, payBill, fetchByConsumer, createOrder, verifyPayment };
