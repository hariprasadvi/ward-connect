require('dotenv').config();
const { sequelize } = require('./src/config/database');
const InsuranceScheme = require('./src/models/InsuranceScheme');
require('./src/models/associations'); // ensure sync

const seedSchemes = [
    {
        name: 'Pradhan Mantri Jan Arogya Yojana',
        coverAmount: '5 Lakhs',
        description: 'Comprehensive coverage for secondary and tertiary care hospitalization for low-income families.',
        incomeLimit: 500000
    },
    {
        name: 'Employees State Insurance',
        coverAmount: 'Full Medical Care',
        description: 'Social security and health insurance for employees.',
        incomeLimit: 252000,
        employmentRestriction: 'Private Sector,Government'
    },
    {
        name: 'Senior Citizen Health Insurance',
        coverAmount: '3 Lakhs',
        description: 'Specialized care for senior citizens.',
        minAge: 60
    },
    {
        name: 'Karunya Health Scheme',
        coverAmount: '2 Lakhs',
        description: 'Critical illness coverage for BPL families in Kerala.',
        incomeLimit: 300000,
        stateRestriction: 'Kerala'
    }
];

async function runSeed() {
    try {
        await sequelize.authenticate();
        await sequelize.sync({ alter: true }); // Make sure table is created
        console.log('Database connected and synced.');

        const count = await InsuranceScheme.count();
        if (count === 0) {
            await InsuranceScheme.bulkCreate(seedSchemes);
            console.log('Insurance Schemes seeded successfully!');
        } else {
            console.log(`Database already has ${count} schemes.`);
        }
    } catch (e) {
        console.error('Error seeding data:', e);
    } finally {
        process.exit();
    }
}

runSeed();
