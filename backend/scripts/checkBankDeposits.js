const mongoose = require('mongoose');
const BankDeposit = require('../models/BankDeposit');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/akr-sons', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function checkBankDeposits() {
  try {
    console.log('🔍 Checking bank deposits for slip images...');
    
    // Get all bank deposits
    const deposits = await BankDeposit.find({});
    console.log(`📊 Found ${deposits.length} bank deposits`);
    
    // Check each deposit
    deposits.forEach((deposit, index) => {
      console.log(`\n${index + 1}. Deposit ID: ${deposit._id}`);
      console.log(`   Date: ${deposit.date}`);
      console.log(`   Depositer: ${deposit.depositerName}`);
      console.log(`   Purpose: ${deposit.purpose}`);
      console.log(`   Payment: ${deposit.payment}`);
      console.log(`   Slip Image: ${deposit.slipImage || 'No slip'}`);
      
      // Check if this is the specific record mentioned
      if (deposit.purpose && deposit.purpose.includes('VAC-021') && deposit.payment === 654650) {
        console.log('   ⭐ This appears to be the record mentioned by the user!');
        console.log('   🔍 Checking if slipImage field exists in schema...');
        console.log('   📋 Full record:', JSON.stringify(deposit, null, 2));
      }
    });
    
    // Check schema
    console.log('\n🔧 Checking BankDeposit schema...');
    const schema = BankDeposit.schema.obj;
    console.log('Available fields:', Object.keys(schema));
    console.log('slipImage field exists:', 'slipImage' in schema);
    
  } catch (error) {
    console.error('❌ Error checking bank deposits:', error);
  } finally {
    mongoose.connection.close();
  }
}

checkBankDeposits(); 