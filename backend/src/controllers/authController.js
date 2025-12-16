const User = require('../models/User');
const OtpVerification = require('../models/Otp');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, role: user.role, mobile_number: user.mobile_number },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
};

exports.signup = async (req, res) => {
    try {
        const {
            full_name, mobile_number, email, password, role,
            ward_number, panchayat_name, address, aadhaar_number
        } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ where: { mobile_number } });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists with this mobile number.' });
        }

        const password_hash = await bcrypt.hash(password, 10);

        // Auto-approve citizens, others require admin approval (logic can be refined)
        const is_approved = role === 'Citizen';

        const newUser = await User.create({
            full_name,
            mobile_number,
            email,
            password_hash,
            role,
            ward_number,
            panchayat_name,
            address,
            aadhaar_number,
            is_approved,
            is_verified: true // Assuming mobile OTP verification happens BEFORE this step or integrated
        });

        res.status(201).json({
            message: 'User registered successfully',
            user: { id: newUser.id, role: newUser.role, is_approved }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during signup', error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { mobile_number, password, role } = req.body;

        const user = await User.findOne({ where: { mobile_number } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (role && user.role !== role) {
            return res.status(403).json({ message: `Incorrect role. User is registered as ${user.role}` });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        if (!user.is_approved) {
            return res.status(403).json({ message: 'Account pending approval by Admin.' });
        }

        const token = generateToken(user);

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                full_name: user.full_name,
                role: user.role,
                ward_number: user.ward_number
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during login' });
    }
};

exports.sendOtp = async (req, res) => {
    // Logic to integrate with SMS provider (e.g., Twilio)
    // For demo purposes, we'll just return the OTP
    const { mobile_number } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit OTP

    // Save to DB
    // First clear old OTPs for this number
    await OtpVerification.destroy({ where: { mobile_number } });
    await OtpVerification.create({
        mobile_number,
        otp,
        expires_at: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
    });

    console.log(`OTP for ${mobile_number}: ${otp}`);
    res.json({ message: 'OTP sent successfully', otp_debug: otp });
};

exports.verifyOtp = async (req, res) => {
    const { mobile_number, otp } = req.body;
    const verification = await OtpVerification.findOne({ where: { mobile_number, otp } });

    if (!verification) {
        return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (new Date() > verification.expires_at) {
        return res.status(400).json({ message: 'OTP expired' });
    }

    // Mark verified logic here if this was a standalone verification step

    // Clean up
    await verification.destroy();

    res.json({ message: 'OTP verified successfully' });
};
