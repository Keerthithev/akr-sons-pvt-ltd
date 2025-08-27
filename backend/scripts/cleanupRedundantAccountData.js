const mongoose = require('mongoose');
require('dotenv').config();
const AccountData = require('../models/AccountData');
const VehicleAllocationCoupon = require('../models/VehicleAllocationCoupon');

async function cleanupRedundantAccountData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/akr-sons', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Get all VACs
    const vacs = await VehicleAllocationCoupon.find({});
    console.log(`Found ${vacs.length} Vehicle Allocation Coupons`);

    let totalCleaned = 0;

    for (const vac of vacs) {
      console.log(`\nProcessing VAC: ${vac.couponId}`);
      
      // Find the Money Collection entry for this VAC
      const moneyCollectionEntry = await AccountData.findOne({
        details: { $regex: `Money Collection - Vehicle Allocation Coupon ${vac.couponId}`, $options: 'i' }
      });

      if (!moneyCollectionEntry) {
        console.log(`  ❌ No Money Collection entry found for VAC ${vac.couponId}`);
        continue;
      }

      console.log(`  ✅ Found Money Collection entry: LKR ${Math.abs(moneyCollectionEntry.amount).toLocaleString()}`);

      // Find and delete the old separate payment entries
      const oldEntries = await AccountData.find({
        details: { $regex: `Vehicle Allocation Coupon ${vac.couponId}`, $options: 'i' },
        type: { $in: ['Advance Payment', 'Down Payment', 'Registration Fee', 'Document Charge'] }
      });

      if (oldEntries.length === 0) {
        console.log(`  ✅ No old separate entries found for VAC ${vac.couponId}`);
        continue;
      }

      console.log(`  🗑️  Found ${oldEntries.length} old separate entries to delete:`);
      oldEntries.forEach(entry => {
        console.log(`    - ${entry.type}: LKR ${Math.abs(entry.amount).toLocaleString()}`);
      });

      // Delete the old entries
      await AccountData.deleteMany({
        details: { $regex: `Vehicle Allocation Coupon ${vac.couponId}`, $options: 'i' },
        type: { $in: ['Advance Payment', 'Down Payment', 'Registration Fee', 'Document Charge'] }
      });

      console.log(`  ✅ Deleted ${oldEntries.length} old separate entries`);
      totalCleaned += oldEntries.length;
    }

    console.log(`\n🎉 Cleanup completed!`);
    console.log(`Total old entries removed: ${totalCleaned}`);

    // Final verification
    const totalMoneyCollectionEntries = await AccountData.countDocuments({ 
      details: { $regex: 'Money Collection - Vehicle Allocation Coupon', $options: 'i' }
    });
    const totalOldEntries = await AccountData.countDocuments({ 
      type: { $in: ['Advance Payment', 'Down Payment', 'Registration Fee', 'Document Charge'] } 
    });

    console.log(`\n📊 Final Statistics:`);
    console.log(`- Money Collection entries: ${totalMoneyCollectionEntries}`);
    console.log(`- Remaining old separate entries: ${totalOldEntries}`);

    // Show remaining entries for verification
    const remainingEntries = await AccountData.find({}).sort({ date: -1 }).limit(10);
    console.log(`\n📋 Sample of remaining entries:`);
    remainingEntries.forEach((entry, index) => {
      console.log(`${index + 1}. ${entry.details}`);
      console.log(`   Amount: LKR ${entry.amount.toLocaleString()}, Type: ${entry.type || 'Manual Entry'}`);
    });

  } catch (error) {
    console.error('Error during cleanup:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

cleanupRedundantAccountData(); 