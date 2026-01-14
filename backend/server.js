const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { sequelize } = require('./src/config/database');
const authRoutes = require('./src/routes/authRoutes');
const jobRoutes = require('./src/routes/jobRoutes');
const meetingRoutes = require('./src/routes/meetingRoutes');
const attendanceRoutes = require('./src/routes/attendanceRoutes');
const loanRoutes = require('./src/routes/loanRoutes');
const financialRoutes = require('./src/routes/financialRoutes');
const memberRoutes = require('./src/routes/memberRoutes');
const reportRoutes = require('./src/routes/reportRoutes');
const wastePickupRoutes = require('./src/routes/wastePickupRoutes');
const wasteComplaintRoutes = require('./src/routes/wasteComplaintRoutes');
const wasteAiRoutes = require('./src/routes/wasteAiRoutes');
const houseMessageRoutes = require('./src/routes/houseMessageRoutes');
const userRoutes = require('./src/routes/userRoutes');
const vehicleRoutes = require('./src/routes/vehicleRoutes');
const { authenticate } = require('./src/middleware/auth');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Public Routes
app.use('/auth', authRoutes);

// Protected Routes
app.use('/api', authenticate); // Protect all API routes

// Core Routes
app.use('/api/users', userRoutes);
app.use('/api/vehicle', vehicleRoutes); // Single 'vehicle' to match frontend service
app.use('/api/job', jobRoutes);
app.use('/api/house-messages', houseMessageRoutes);

// Waste Management Routes
app.use('/api/waste/pickups', wastePickupRoutes);
app.use('/api/waste/complaints', wasteComplaintRoutes);
app.use('/api/waste/ai', wasteAiRoutes);

// Kudumbashree Routes
app.use('/api/kudumbashree/meeting', meetingRoutes);
app.use('/api/kudumbashree/attendance', attendanceRoutes);
app.use('/api/kudumbashree/loan', loanRoutes);
app.use('/api/kudumbashree/financial', financialRoutes);
app.use('/api/kudumbashree/member', memberRoutes);
app.use('/api/kudumbashree/report', reportRoutes);

// Test Route
app.get('/', (req, res) => {
  res.send('WardConnect Backend is Running');
});

// Database Connection & Server Start
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');

    // Sync models (Force: false -> creates tables if not exist)
    await sequelize.sync({ alter: true });

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

startServer();
