const mongoose = require('mongoose');
require('dotenv').config();
const AccountData = require('../models/AccountData');
const VehicleAllocationCoupon = require('../models/VehicleAllocationCoupon');

async function fixVACDepositStatus() {
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

    // Get all Account Data entries
    const allAccountData = await AccountData.find({});
    
    // Find VAC Money Collection entries
    const vacMoneyCollections = allAccountData.filter(entry => 
      entry.details.includes('Money Collection - Vehicle Allocation Coupon')
    );
    
    // Find Bank Deposit entries that mention VACs
    const vacBankDeposits = allAccountData.filter(entry => 
      entry.details.includes('Bank Deposit') && entry.details.includes('VAC-')
    );

    console.log(`\n📊 Analysis:`);
    console.log(`- VAC Money Collection entries: ${vacMoneyCollections.length}`);
    console.log(`- VAC Bank Deposit entries: ${vacBankDeposits.length}`);

    if (vacBankDeposits.length === 0) {
      console.log(`\n✅ No VAC Bank Deposit entries found. All VACs are correctly marked as pending.`);
      console.log(`\n💡 The Bank Deposit entries you see are for Advanced Customer Pre-Bookings, not VACs.`);
      console.log(`   VACs will be marked as deposited when you create bank deposits for them.`);
      return;
    }

    // Check each VAC for bank deposits
    let updatedCount = 0;
    
    for (const vac of vacs) {
      const vacMoneyEntry = vacMoneyCollections.find(entry => 
        entry.details.includes(`VAC-${vac.couponId}`)
      );
      
      const vacBankDeposits = allAccountData.filter(entry => 
        entry.details.includes('Bank Deposit') && entry.details.includes(`VAC-${vac.couponId}`)
      );

      if (vacMoneyEntry && vacBankDeposits.length > 0) {
        // This VAC has bank deposits, should be marked as deposited
        if (vacMoneyEntry.depositedToBank === false) {
          console.log(`\n🔄 Updating VAC-${vac.couponId}:`);
          console.log(`  Money collected: LKR ${Math.abs(vacMoneyEntry.amount).toLocaleString()}`);
          console.log(`  Bank deposits found: ${vacBankDeposits.length} entries`);
          
          // Update the VAC Money Collection entry
          await AccountData.findByIdAndUpdate(vacMoneyEntry._id, {
            depositedToBank: true,
            depositedAmount: Math.abs(vacMoneyEntry.amount),
            bankDepositDate: new Date()
          });
          
          console.log(`  ✅ Marked as deposited`);
          updatedCount++;
        } else {
          console.log(`\n✅ VAC-${vac.couponId}: Already correctly marked as deposited`);
        }
      } else if (vacMoneyEntry && vacBankDeposits.length === 0) {
        console.log(`\n⏳ VAC-${vac.couponId}: No bank deposits found, correctly marked as pending`);
      }
    }

    console.log(`\n🎉 Fix completed!`);
    console.log(`- Updated ${updatedCount} VAC Money Collection entries`);
    console.log(`- Total VACs: ${vacs.length}`);

    // Show final status
    const finalVacMoneyCollections = await AccountData.find({
      details: { $regex: 'Money Collection - Vehicle Allocation Coupon' }
    });
    
    const depositedVACs = finalVacMoneyCollections.filter(entry => entry.depositedToBank === true).length;
    const pendingVACs = finalVacMoneyCollections.filter(entry => entry.depositedToBank === false).length;
    
    console.log(`\n📈 Final Status:`);
    console.log(`- Deposited VACs: ${depositedVACs}`);
    console.log(`- Pending VACs: ${pendingVACs}`);

  } catch (error) {
    console.error('Error during fix:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

fixVACDepositStatus(); 