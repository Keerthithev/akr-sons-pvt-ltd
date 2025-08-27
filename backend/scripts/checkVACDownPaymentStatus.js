const mongoose = require('mongoose');
require('dotenv').config();
const AccountData = require('../models/AccountData');
const VehicleAllocationCoupon = require('../models/VehicleAllocationCoupon');

async function checkVACDownPaymentStatus() {
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
    
    console.log(`\n🔍 VAC Down Payment Analysis:`);
    console.log(`================================`);

    for (const vac of vacs) {
      console.log(`\n📋 VAC-${vac.couponId} - ${vac.fullName}`);
      console.log(`   Vehicle: ${vac.vehicleType}`);
      console.log(`   Total Amount: LKR ${parseFloat(vac.totalAmount).toLocaleString()}`);
      console.log(`   Advance Payment: LKR ${parseFloat(vac.advancePayment || 0).toLocaleString()}`);
      console.log(`   Down Payment: LKR ${parseFloat(vac.downPayment || 0).toLocaleString()}`);
      console.log(`   Balance: LKR ${parseFloat(vac.balance || 0).toLocaleString()}`);
      console.log(`   Status: ${vac.status}`);
      
      // Find corresponding Account Data entry
      const accountDataEntry = allAccountData.find(entry => 
        entry.details.includes(`Money Collection - Vehicle Allocation Coupon ${vac.couponId}`)
      );

      if (accountDataEntry) {
        console.log(`   📊 Account Data Entry:`);
        console.log(`      Amount: LKR ${accountDataEntry.amount.toLocaleString()}`);
        console.log(`      Deposited to Bank: ${accountDataEntry.depositedToBank}`);
        console.log(`      Type: ${accountDataEntry.type || 'Manual Entry'}`);
        
        // Check if amounts match
        const vacTotalCollected = parseFloat(vac.advancePayment || 0) + parseFloat(vac.downPayment || 0) + 
                                parseFloat(vac.regFee || 0) + parseFloat(vac.docCharge || 0);
        const accountDataAmount = Math.abs(accountDataEntry.amount);
        
        if (Math.abs(vacTotalCollected - accountDataAmount) < 1) {
          console.log(`   ✅ Amounts match: VAC (${vacTotalCollected.toLocaleString()}) = Account Data (${accountDataAmount.toLocaleString()})`);
        } else {
          console.log(`   ❌ Amount mismatch: VAC (${vacTotalCollected.toLocaleString()}) ≠ Account Data (${accountDataAmount.toLocaleString()})`);
        }
        
        // Check if down payment is collected but not marked in VAC
        if (parseFloat(vac.downPayment || 0) > 0 && accountDataEntry.depositedToBank === false) {
          console.log(`   ⚠️  Down Payment collected but not deposited to bank yet`);
        } else if (parseFloat(vac.downPayment || 0) > 0 && accountDataEntry.depositedToBank === true) {
          console.log(`   ✅ Down Payment collected and deposited to bank`);
        }
        
      } else {
        console.log(`   ❌ No Account Data entry found for this VAC`);
      }
    }

    // Summary
    console.log(`\n📈 SUMMARY:`);
    const completedVACs = vacs.filter(vac => vac.status === 'Completed').length;
    const pendingVACs = vacs.filter(vac => vac.status === 'Pending').length;
    
    console.log(`- Completed VACs: ${completedVACs}`);
    console.log(`- Pending VACs: ${pendingVACs}`);
    console.log(`- Total VACs: ${vacs.length}`);

    // Check for VACs with down payments but not marked as collected
    const vacsWithDownPayment = vacs.filter(vac => parseFloat(vac.downPayment || 0) > 0);
    console.log(`- VACs with Down Payment: ${vacsWithDownPayment.length}`);
    
    const vacsWithDownPaymentNotDeposited = vacsWithDownPayment.filter(vac => {
      const accountDataEntry = allAccountData.find(entry => 
        entry.details.includes(`Money Collection - Vehicle Allocation Coupon ${vac.couponId}`)
      );
      return accountDataEntry && accountDataEntry.depositedToBank === false;
    });
    
    console.log(`- VACs with Down Payment not deposited: ${vacsWithDownPaymentNotDeposited.length}`);

  } catch (error) {
    console.error('Error during analysis:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

checkVACDownPaymentStatus(); 