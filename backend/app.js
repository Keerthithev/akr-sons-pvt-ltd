const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const path = require('path');
const errorHandler = require('./middleware/errorHandler');
const authRoutes = require('./routes/auth');
const vehicleRoutes = require('./routes/vehicle');
const preBookingRoutes = require('./routes/preBooking');
const companyRoutes = require('./routes/company');
const customerRoutes = require('./routes/customer');
const settingRoutes = require('./routes/setting');
const accountDataRoutes = require('./routes/accountData');
const bankDepositRoutes = require('./routes/bankDeposit');
const bikeInventoryRoutes = require('./routes/bikeInventory');
const salesTransactionRoutes = require('./routes/salesTransaction');
const installmentPlanRoutes = require('./routes/installmentPlan');
const supplierRoutes = require('./routes/supplier');
const serviceWarrantyRoutes = require('./routes/serviceWarranty');
const additionalInfoRoutes = require('./routes/additionalInfo');
const vehicleAllocationCouponRoutes = require('./routes/vehicleAllocationCoupon');
const advancedCustomerRoutes = require('./routes/advancedCustomer');

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

// Health check endpoint to keep the app awake
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/prebookings', preBookingRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/account-data', accountDataRoutes);
app.use('/api/bank-deposits', bankDepositRoutes);
app.use('/api/bike-inventory', bikeInventoryRoutes);
app.use('/api/sales-transactions', salesTransactionRoutes);
app.use('/api/installment-plans', installmentPlanRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/service-warranty', serviceWarrantyRoutes);
app.use('/api/additional-info', additionalInfoRoutes);
app.use('/api/vehicle-allocation-coupons', vehicleAllocationCouponRoutes);
app.use('/api/advanced-customers', advancedCustomerRoutes);

// Serve static files from the React app build directory
const distPath = path.join(__dirname, 'dist');
console.log('Static files path:', distPath);
console.log('Dist folder exists:', require('fs').existsSync(distPath));

// Only serve static files if dist folder exists
if (require('fs').existsSync(distPath)) {
  app.use(express.static(distPath));
  console.log('✅ Static files middleware enabled');
} else {
  console.log('⚠️ Dist folder not found, static files disabled');
}

// Catch-all handler: send back React's index.html file for any non-API routes
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'dist/index.html');
  console.log('Serving index.html from:', indexPath);
  console.log('Index.html exists:', require('fs').existsSync(indexPath));
  
  if (require('fs').existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    // Fallback: Send a simple HTML page with instructions
    res.status(404).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>AKR & Sons - Deployment Issue</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; text-align: center; }
            .container { max-width: 600px; margin: 0 auto; }
            .error { color: #d32f2f; background: #ffebee; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .success { color: #388e3c; background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .info { background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🚀 AKR & Sons</h1>
            
            <div class="error">
              <h2>⚠️ Frontend Not Found</h2>
              <p>The React frontend has not been built or the dist folder is missing.</p>
              <p><strong>Path:</strong> ${indexPath}</p>
              <p><strong>Exists:</strong> ${require('fs').existsSync(indexPath)}</p>
            </div>
            
            <div class="info">
              <h3>🔧 What's Working:</h3>
              <p>✅ Backend server is running</p>
              <p>✅ API endpoints are functional</p>
              <p>✅ Health check: <a href="/api/health">/api/health</a></p>
            </div>
            
            <div class="success">
              <h3>📋 Next Steps:</h3>
              <p>1. Check Render build logs</p>
              <p>2. Ensure build script runs successfully</p>
              <p>3. Verify dist folder is copied to backend</p>
              <p>4. Redeploy with updated build process</p>
            </div>
            
            <p><em>This is a temporary page while the frontend is being deployed.</em></p>
          </div>
        </body>
      </html>
    `);
  }
});

// Error Handler
app.use(errorHandler);

module.exports = app;

