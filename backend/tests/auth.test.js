const authController = require('../src/controllers/authController');
const User = require('../src/models/User');
const OtpVerification = require('../src/models/Otp');
const bcrypt = require('bcryptjs');

// Mock external dependencies
jest.mock('../src/models/User');
jest.mock('../src/models/Otp');
jest.mock('bcryptjs');

describe('Auth Controller Unit Tests', () => {
    let req;
    let res;

    beforeEach(() => {
        req = {
            body: {}
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn()
        };
        jest.clearAllMocks();
    });

    describe('sendOtp', () => {
        it('should return 400 if mobile number is missing', async () => {
            req.body = {}; // empty body
            await authController.sendOtp(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Mobile number is required.' });
        });

        it('should generate and save an OTP if mobile number is provided', async () => {
            req.body = { mobile_number: '1234567890' };
            OtpVerification.destroy.mockResolvedValue(1);
            OtpVerification.create.mockResolvedValue({});
            
            await authController.sendOtp(req, res);
            
            expect(OtpVerification.destroy).toHaveBeenCalled();
            expect(OtpVerification.create).toHaveBeenCalled();
            // It should fall back to JSON response because no Fast2SMS key is mocked here
            expect(res.json).toHaveBeenCalled();
        });
    });

    describe('resetPassword', () => {
        it('should return 404 if user not found', async () => {
            req.body = { mobile_number: '0000', new_password: '123' };
            User.findOne.mockResolvedValue(null);

            await authController.resetPassword(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
        });

        it('should successfully update the password if user is found', async () => {
            req.body = { mobile_number: '1234567890', new_password: 'new_pass' };
            const fakeUser = {
                role: 'Citizen',
                save: jest.fn().mockResolvedValue(true)
            };
            User.findOne.mockResolvedValue(fakeUser);
            bcrypt.hash.mockResolvedValue('hashed_password');

            await authController.resetPassword(req, res);

            expect(fakeUser.password_hash).toBe('hashed_password');
            expect(fakeUser.save).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith({ message: 'Password reset successfully' });
        });

        it('should return 403 if roles do not match', async () => {
            req.body = { mobile_number: '1234567890', role: 'Admin', new_password: '123' };
            const fakeUser = { role: 'Citizen' };
            User.findOne.mockResolvedValue(fakeUser);

            await authController.resetPassword(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({ message: 'Role does not match registered role for this number' });
        });
    });
});
