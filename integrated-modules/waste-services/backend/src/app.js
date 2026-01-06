const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const authRoutes = require('./routes/auth.routes');
const pickupRoutes = require('./routes/pickup.routes');
const complaintRoutes = require('./routes/complaint.routes');
const aiRoutes = require('./routes/ai.routes');

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/pickups', pickupRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/ai', aiRoutes);

app.get('/', (req, res) => {
  res.send('Waste Management API is running');
});

module.exports = app;
