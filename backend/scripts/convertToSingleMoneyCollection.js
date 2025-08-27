const mongoose = require('mongoose');
require('dotenv').config();
const AccountData = require('../models/AccountData');
const VehicleAllocationCoupon = require('../models/VehicleAllocationCoupon');

async function convertToSingleMoneyCollection() {
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

    let totalConverted = 0;

    for (const vac of vacs) {
      console.log(`\nProcessing VAC: ${vac.couponId}`);
      
      // Find all existing payment collection entries for this VAC
      const existingEntries = await AccountData.find({
        details: { $regex: `Vehicle Allocation Coupon ${vac.couponId}`, $options: 'i' },
        type: { $in: ['Advance Payment', 'Down Payment', 'Registration Fee', 'Document Charge'] }
      });

      if (existingEntries.length === 0) {
        console.log(`  No existing payment entries found for VAC ${vac.couponId}`);
        continue;
      }

      console.log(`  Found ${existingEntries.length} existing payment entries`);

      // Calculate total money collected from existing entries
      const totalCollected = existingEntries.reduce((sum, entry) => sum + Math.abs(entry.amount), 0);
      
      // Calculate total from VAC data for verification
      const vacTotal = (parseFloat(vac.advancePayment) || 0) + 
                      (parseFloat(vac.downPayment) || 0) + 
                      (parseFloat(vac.regFee) || 0) + 
                      (parseFloat(vac.docCharge) || 0);

      console.log(`  Total from existing entries: ${totalCollected}`);
      console.log(`  Total from VAC data: ${vacTotal}`);

      if (totalCollected > 0) {
        // Delete existing separate entries
        await AccountData.deleteMany({
          details: { $regex: `Vehicle Allocation Coupon ${vac.couponId}`, $options: 'i' },
          type: { $in: ['Advance Payment', 'Down Payment', 'Registration Fee', 'Document Charge'] }
        });

        // Create single money collection entry
        const moneyCollectionEntry = new AccountData({
          date: new Date(),
          name: vac.fullName,
          details: `Money Collection - Vehicle Allocation Coupon ${vac.couponId} - ${vac.vehicleType}`,
          amount: -totalCollected, // Negative amount for money collected
          model: vac.vehicleType,
          type: 'Money Collection',
          depositedToBank: false,
          depositedAmount: 0,
          bankDepositDate: null,
          remarks: `Total money collected for vehicle allocation coupon ${vac.couponId} | Advance: ${vac.advancePayment || 0} | Down Payment: ${vac.downPayment || 0} | Reg Fee: ${vac.regFee || 0} | Doc Charge: ${vac.docCharge || 0}`
        });

        await moneyCollectionEntry.save();
        console.log(`  ✅ Created single Money Collection entry: LKR ${totalCollected.toLocaleString()}`);
        totalConverted++;
      }
    }

    console.log(`\n🎉 Conversion completed!`);
    console.log(`Total VACs converted: ${totalConverted}`);

    // Final verification
    const totalMoneyCollectionEntries = await AccountData.countDocuments({ type: 'Money Collection' });
    const totalOldEntries = await AccountData.countDocuments({ 
      type: { $in: ['Advance Payment', 'Down Payment', 'Registration Fee', 'Document Charge'] } 
    });

    console.log(`\n📊 Final Statistics:`);
    console.log(`- Money Collection entries: ${totalMoneyCollectionEntries}`);
    console.log(`- Remaining old entries: ${totalOldEntries}`);

  } catch (error) {
    console.error('Error during conversion:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

convertToSingleMoneyCollection(); 