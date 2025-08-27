const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const AccountData = require('../models/AccountData');
const VehicleAllocationCoupon = require('../models/VehicleAllocationCoupon');

async function debugAccountData() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('🔍 DEBUGGING ACCOUNT DATA');
    console.log('=========================\n');

    // Check all Account Data entries
    const allAccountData = await AccountData.find().sort({ date: -1 });
    console.log(`Total Account Data records: ${allAccountData.length}\n`);

    console.log('📋 All Account Data Entries:');
    allAccountData.forEach((record, index) => {
      console.log(`${index + 1}. ${record.details}`);
      console.log(`   Amount: LKR ${record.amount}, Type: ${record.type || 'No Type'}, Deposited: ${record.depositedToBank}`);
      console.log('');
    });

    // Check VAC entries specifically
    console.log('🚗 Checking VAC-related entries:');
    const vacEntries = allAccountData.filter(record => 
      record.details.includes('Vehicle Allocation Coupon')
    );
    
    console.log(`Found ${vacEntries.length} VAC-related entries:`);
    vacEntries.forEach((record, index) => {
      console.log(`${index + 1}. ${record.details}`);
      console.log(`   Amount: LKR ${record.amount}, Type: ${record.type || 'No Type'}`);
    });

    // Check specific VAC
    console.log('\n🔍 Checking VAC-001 specifically:');
    const vac001Entries = allAccountData.filter(record => 
      record.details.includes('VAC-001')
    );
    
    console.log(`Found ${vac001Entries.length} VAC-001 entries:`);
    vac001Entries.forEach((record, index) => {
      console.log(`${index + 1}. ${record.details}`);
      console.log(`   Amount: LKR ${record.amount}, Type: ${record.type || 'No Type'}`);
    });

    // Check VAC data
    console.log('\n🚗 VAC Data:');
    const vacs = await VehicleAllocationCoupon.find().sort({ couponId: 1 });
    vacs.forEach(vac => {
      console.log(`${vac.couponId}:`);
      console.log(`  Advance: LKR ${vac.advancePayment}`);
      console.log(`  Down Payment: LKR ${vac.downPayment}`);
      console.log(`  Reg Fee: LKR ${vac.regFee}`);
      console.log(`  Doc Charge: LKR ${vac.docCharge}`);
    });

    await mongoose.disconnect();
    console.log('\n✅ Database connection closed');

  } catch (error) {
    console.error('❌ Error debugging account data:', error);
    process.exit(1);
  }
}

debugAccountData(); 