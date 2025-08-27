const mongoose = require('mongoose');
require('dotenv').config();
const AccountData = require('../models/AccountData');
const VehicleAllocationCoupon = require('../models/VehicleAllocationCoupon');

async function checkVACBankDepositSync() {
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
    
    // Separate VAC Money Collection entries and Bank Deposit entries
    const vacMoneyCollections = allAccountData.filter(entry => 
      entry.details.includes('Money Collection - Vehicle Allocation Coupon')
    );
    
    const bankDeposits = allAccountData.filter(entry => 
      entry.details.includes('Bank Deposit - Deposited from Account Data')
    );

    console.log(`\n📊 Account Data Analysis:`);
    console.log(`- VAC Money Collection entries: ${vacMoneyCollections.length}`);
    console.log(`- Bank Deposit entries: ${bankDeposits.length}`);

    console.log(`\n🔍 VAC Money Collection Entries:`);
    vacMoneyCollections.forEach(entry => {
      const vacId = entry.details.match(/VAC-\d+/)?.[0];
      console.log(`  ${vacId}: LKR ${Math.abs(entry.amount).toLocaleString()} - Deposited: ${entry.depositedToBank}`);
    });

    console.log(`\n🏦 Bank Deposit Entries:`);
    bankDeposits.forEach(entry => {
      console.log(`  ${entry.details} - Amount: LKR ${entry.amount.toLocaleString()} - Deposited: ${entry.depositedToBank}`);
    });

    // Check for mismatches
    console.log(`\n⚠️  SYNC ISSUES FOUND:`);
    
    for (const vac of vacs) {
      const vacMoneyEntry = vacMoneyCollections.find(entry => 
        entry.details.includes(`VAC-${vac.couponId}`)
      );
      
      const vacBankDeposits = bankDeposits.filter(entry => 
        entry.details.includes(`VAC-${vac.couponId}`)
      );

      if (vacMoneyEntry && vacBankDeposits.length > 0) {
        // This VAC has both money collection and bank deposits
        const totalDeposited = vacBankDeposits.reduce((sum, deposit) => sum + deposit.amount, 0);
        const moneyCollected = Math.abs(vacMoneyEntry.amount);
        
        if (vacMoneyEntry.depositedToBank === false) {
          console.log(`  ❌ VAC-${vac.couponId}: Money collected LKR ${moneyCollected.toLocaleString()}, Bank deposits LKR ${totalDeposited.toLocaleString()}, but still marked as NOT deposited!`);
        } else {
          console.log(`  ✅ VAC-${vac.couponId}: Money collected LKR ${moneyCollected.toLocaleString()}, Bank deposits LKR ${totalDeposited.toLocaleString()}, correctly marked as deposited.`);
        }
      } else if (vacMoneyEntry && vacBankDeposits.length === 0) {
        console.log(`  ⏳ VAC-${vac.couponId}: Money collected LKR ${Math.abs(vacMoneyEntry.amount).toLocaleString()}, no bank deposits yet.`);
      }
    }

    // Summary
    const depositedVACs = vacMoneyCollections.filter(entry => entry.depositedToBank === true).length;
    const pendingVACs = vacMoneyCollections.filter(entry => entry.depositedToBank === false).length;
    
    console.log(`\n📈 SUMMARY:`);
    console.log(`- Deposited VACs: ${depositedVACs}`);
    console.log(`- Pending VACs: ${pendingVACs}`);
    console.log(`- Total VAC Money Collections: ${vacMoneyCollections.length}`);

  } catch (error) {
    console.error('Error during analysis:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

checkVACBankDepositSync(); 