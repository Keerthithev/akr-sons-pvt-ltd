const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Import models
const AccountData = require('../models/AccountData');
const BankDeposit = require('../models/BankDeposit');

const fixSarmilanRefund = async () => {
  try {
    console.log('🔧 Fixing Sarmilan Refund...\n');

    // Find Sarmilan's AccountData entry
    const sarmilanAccountData = await AccountData.findOne({
      name: { $regex: /sarmilan/i }
    });

    if (!sarmilanAccountData) {
      console.log('❌ No AccountData entry found for Sarmilan');
      return;
    }

    console.log('📋 Found Sarmilan AccountData entry:');
    console.log(`   Name: ${sarmilanAccountData.name}`);
    console.log(`   Amount: LKR ${sarmilanAccountData.amount?.toLocaleString()}`);
    console.log(`   Type: ${sarmilanAccountData.type}`);
    console.log(`   Deposited to Bank: ${sarmilanAccountData.depositedToBank}`);
    console.log(`   Deposited Amount: LKR ${sarmilanAccountData.depositedAmount?.toLocaleString()}`);
    console.log(`   Details: ${sarmilanAccountData.details}`);

    // Check if there's a matching bank deposit
    const matchingBankDeposit = await BankDeposit.findOne({
      payment: sarmilanAccountData.amount,
      date: sarmilanAccountData.bankDepositDate
    });

    if (matchingBankDeposit) {
      console.log('\n🏦 Found matching bank deposit:');
      console.log(`   Payment: LKR ${matchingBankDeposit.payment?.toLocaleString()}`);
      console.log(`   Date: ${matchingBankDeposit.date}`);
      console.log(`   Description: ${matchingBankDeposit.description}`);

      // Reduce the bank deposit amount
      console.log('\n📉 Reducing bank deposit amount...');
      matchingBankDeposit.payment -= sarmilanAccountData.amount;
      
      if (matchingBankDeposit.payment === 0) {
        // Delete the bank deposit record if amount becomes 0
        await BankDeposit.findByIdAndDelete(matchingBankDeposit._id);
        console.log('   🗑️ Deleted bank deposit record (amount became 0)');
      } else {
        await matchingBankDeposit.save();
        console.log(`   💾 Updated bank deposit to LKR ${matchingBankDeposit.payment?.toLocaleString()}`);
      }
    } else {
      console.log('\n⚠️ No matching bank deposit found');
      console.log('   This means the amount was marked as deposited but never actually deposited');
      console.log('   The AccountData entry will be deleted to cancel the pending amount');
    }

    // Delete the AccountData entry
    console.log('\n🗑️ Deleting Sarmilan AccountData entry...');
    await AccountData.findByIdAndDelete(sarmilanAccountData._id);
    console.log('   ✅ AccountData entry deleted');

    // Verify the fix
    console.log('\n🔍 Verifying the fix...');
    const remainingSarmilanData = await AccountData.find({
      name: { $regex: /sarmilan/i }
    });
    
    if (remainingSarmilanData.length === 0) {
      console.log('   ✅ No remaining Sarmilan records found');
    } else {
      console.log(`   ⚠️ ${remainingSarmilanData.length} remaining Sarmilan records found`);
    }

    console.log('\n🎉 Sarmilan refund fix completed successfully!');
    console.log('💡 The LKR 303,000 has been properly handled:');
    if (matchingBankDeposit) {
      console.log('   - Bank deposit amount was reduced');
    } else {
      console.log('   - Pending amount was cancelled (no actual bank deposit existed)');
    }

  } catch (error) {
    console.error('❌ Error fixing Sarmilan refund:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
};

// Run the script
fixSarmilanRefund(); 