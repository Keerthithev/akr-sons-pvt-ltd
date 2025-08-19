const mongoose = require('mongoose');
const BankDeposit = require('../models/BankDeposit');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/akr-sons', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function fixBankDeposits() {
  try {
    console.log('🔧 Starting to fix bank deposits...');
    
    // Get all bank deposits
    const deposits = await BankDeposit.find({});
    console.log(`📊 Found ${deposits.length} bank deposits`);
    
    let updatedCount = 0;
    
    for (const deposit of deposits) {
      console.log(`\n🔍 Checking deposit: ${deposit._id}`);
      console.log(`   Purpose: ${deposit.purpose}`);
      console.log(`   Payment: ${deposit.payment}`);
      
      // Check if this is the specific record mentioned
      if (deposit.purpose && deposit.purpose.includes('VAC-021') && deposit.payment === 654650) {
        console.log('   ⭐ Found the specific record mentioned by user!');
        console.log('   Current slipImage:', deposit.slipImage);
        
        // If no slipImage field exists, we need to add it
        if (!deposit.slipImage) {
          console.log('   🔧 Adding slipImage field...');
          await BankDeposit.findByIdAndUpdate(deposit._id, {
            $set: { slipImage: '' }
          });
          updatedCount++;
          console.log('   ✅ Updated record');
        }
      }
      
      // Check all records for missing slipImage field
      if (!deposit.hasOwnProperty('slipImage')) {
        console.log(`   🔧 Adding slipImage field to ${deposit._id}...`);
        await BankDeposit.findByIdAndUpdate(deposit._id, {
          $set: { slipImage: '' }
        });
        updatedCount++;
      }
    }
    
    console.log(`\n🎉 Successfully updated ${updatedCount} bank deposits!`);
    
  } catch (error) {
    console.error('❌ Error fixing bank deposits:', error);
  } finally {
    mongoose.connection.close();
  }
}

fixBankDeposits(); 