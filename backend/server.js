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
const { authenticate } = require('./src/middleware/auth');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Public Routes
app.use('/auth', authRoutes);

// Protected Routes
app.use('/api', authenticate); // Protect all API routes
app.use('/api/job', jobRoutes);

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
