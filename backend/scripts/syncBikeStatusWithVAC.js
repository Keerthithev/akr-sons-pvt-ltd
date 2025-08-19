const mongoose = require('mongoose');
const dotenv = require('dotenv');
const BikeInventory = require('../models/BikeInventory');
const VehicleAllocationCoupon = require('../models/VehicleAllocationCoupon');

// Load environment variables
dotenv.config({ path: '../.env' });

// Connect to MongoDB using the same URI as the main app
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/akr-sons';
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('MongoDB connected successfully');
}).catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

async function syncBikeStatusWithVAC() {
  try {
    console.log('Starting bike status synchronization...');

    // Step 1: Set all bikes to 'in' status by default if they don't have status field
    const bikesWithoutStatus = await BikeInventory.updateMany(
      { status: { $exists: false } },
      { $set: { status: 'in', allocatedCouponId: '' } }
    );
    console.log(`Updated ${bikesWithoutStatus.modifiedCount} bikes to default 'in' status`);

    // Step 2: Get all VACs that have engine numbers
    const vacsWithEngines = await VehicleAllocationCoupon.find({
      engineNo: { $exists: true, $ne: '' }
    });
    
    console.log(`Found ${vacsWithEngines.length} VACs with engine numbers`);

    // Step 3: Update bike status for each VAC
    let updatedCount = 0;
    for (const vac of vacsWithEngines) {
      const bike = await BikeInventory.findOne({ engineNo: vac.engineNo });
      
      if (bike) {
        bike.status = 'out';
        bike.allocatedCouponId = vac.couponId;
        await bike.save();
        updatedCount++;
        console.log(`Updated bike ${bike.engineNo} -> OUT (Allocated to ${vac.couponId})`);
      } else {
        console.log(`Warning: No bike found for engine number ${vac.engineNo} (VAC: ${vac.couponId})`);
      }
    }

    console.log(`\nSynchronization complete!`);
    console.log(`- Total VACs processed: ${vacsWithEngines.length}`);
    console.log(`- Bikes updated to 'out' status: ${updatedCount}`);

    // Step 4: Show summary
    const totalBikes = await BikeInventory.countDocuments();
    const bikesIn = await BikeInventory.countDocuments({ status: 'in' });
    const bikesOut = await BikeInventory.countDocuments({ status: 'out' });

    console.log(`\nCurrent status summary:`);
    console.log(`- Total bikes: ${totalBikes}`);
    console.log(`- Bikes IN (Available): ${bikesIn}`);
    console.log(`- Bikes OUT (Allocated): ${bikesOut}`);

    process.exit(0);
  } catch (error) {
    console.error('Error during synchronization:', error);
    process.exit(1);
  }
}

syncBikeStatusWithVAC(); 