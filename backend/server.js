const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const { Server } = require('socket.io');
const { sequelize } = require('./src/config/database');

// Import Models for Association
const Vehicle = require('./src/models/vehicle.model');
const Booking = require('./src/models/booking.model');
const User = require('./src/models/User');

// --- Shop Models & Associations ---
const Product = require('./src/models/Product');
const CartItem = require('./src/models/CartItem');
const WishlistItem = require('./src/models/WishlistItem');
const Order = require('./src/models/Order');
const OrderItem = require('./src/models/OrderItem');
require('./src/models/associations'); // Extra shop associations

// --- Vehicle Associations ---
Vehicle.hasMany(Booking, { foreignKey: 'vehicleId', onDelete: 'CASCADE' });
Booking.belongsTo(Vehicle, { foreignKey: 'vehicleId', onDelete: 'CASCADE' });

// User.hasMany(Booking, ...) and Booking.belongsTo(User, ...) moved to associations.js for central management

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

const cron = require('node-cron');
const { scrapeJobs } = require('./src/services/jobScraper.service');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// Attach socket logic
require('./src/sockets/meetingSocket')(io);

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Public Routes
app.use('/auth', authRoutes);
app.use('/api/shop', require('./src/routes/shopRoutes')); // Shop Routes (Handling its own auth)
app.use('/public/job', jobRoutes); // Expose job alerts for unauthenticated users

// Protected Routes
app.use('/api', authenticate); // Protect all OTHER API routes

// Core Routes
app.use('/api/users', userRoutes);
app.use('/api/vehicle', vehicleRoutes);
app.use('/api/house-messages', houseMessageRoutes);
app.use('/api/bills', require('./src/routes/bill.routes'));
app.use('/api/civic-requests', require('./src/routes/civicRequest.routes'));

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

// Health Service Routes
app.use('/api/health', require('./src/routes/healthRoutes'));

// Test Route
app.get('/', (req, res) => {
  res.send('WardConnect Backend is Running');
});

// Database Connection & Server Start
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');

    // Sync models
    // Using { alter: true } matches schemas
    await sequelize.sync({ alter: true });
    // await sequelize.sync();

    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT} `);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

startServer();
