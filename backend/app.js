const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const errorHandler = require('./middleware/errorHandler');
const authRoutes = require('./routes/auth');
const vehicleRoutes = require('./routes/vehicle');
const preBookingRoutes = require('./routes/preBooking');
const companyRoutes = require('./routes/company');
const customerRoutes = require('./routes/customer');
const settingRoutes = require('./routes/setting');

// Load env vars
dotenv.config({ path: './.env' });

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const allowedOrigins = [
  'https://akrsonspvtltd.netlify.app',
  'https://jazzy-lokum-43b747.netlify.app',
  'https://akr.lk',
  'https://sons.akr.lk',// current deployment
  'http://localhost:8080', // your local frontend
  'http://localhost:8081', // alternate local port
];
app.use(cors({
  origin: allowedOrigins,
  credentials: true, // if you use cookies/auth
}));
app.use(cookieParser());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/prebookings', preBookingRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/settings', settingRoutes);

// Error Handler
app.use(errorHandler);

module.exports = app;

