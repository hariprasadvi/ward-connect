const request = require('supertest');
const app = require('../server');

describe('Server Initialization', () => {
    afterAll(() => {
        // give sequelize a tick to close or let Jest exit nicely
    });

    it('should return WardConnect Backend is Running on root endpoint', async () => {
        const response = await request(app).get('/');
        expect(response.status).toBe(200);
        expect(response.text).toContain('WardConnect Backend is Running');
    });
});
