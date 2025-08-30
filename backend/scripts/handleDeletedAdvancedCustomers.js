const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Import models
const AccountData = require('../models/AccountData');
const BankDeposit = require('../models/BankDeposit');

const handleDeletedAdvancedCustomers = async () => {
  try {
    console.log('🔧 Starting Deleted Advanced Customers Financial Records Fix...\n');

    // Find all AccountData entries for advanced customers that might be orphaned
    const advancedCustomerAccountData = await AccountData.find({
      type: 'Advanced Customer'
    });

    console.log(`📊 Found ${advancedCustomerAccountData.length} Advanced Customer AccountData entries\n`);

    let processedCount = 0;
    let bankDepositReducedCount = 0;
    let markedAsDepositedCount = 0;

    for (const accountEntry of advancedCustomerAccountData) {
      console.log(`\n💰 Processing: ${accountEntry.name} - LKR ${accountEntry.amount?.toLocaleString()}`);
      console.log(`   Status: ${accountEntry.depositedToBank ? 'Deposited' : 'Pending'}`);

      if (accountEntry.depositedToBank) {
        // If deposited, check if we need to reduce bank deposit
        const bankDeposit = await BankDeposit.findOne({
          payment: accountEntry.amount,
          date: accountEntry.bankDepositDate
        });

        if (bankDeposit) {
          console.log(`   ✅ Found matching bank deposit (ID: ${bankDeposit._id})`);
          console.log(`   📉 Reducing bank deposit from LKR ${bankDeposit.payment?.toLocaleString()}`);
          
          // Reduce the bank deposit amount
          bankDeposit.payment -= accountEntry.amount;
          
          if (bankDeposit.payment === 0) {
            // If payment becomes 0, delete the bank deposit record
            await BankDeposit.findByIdAndDelete(bankDeposit._id);
            console.log(`   🗑️ Deleted bank deposit record (amount became 0)`);
          } else {
            await bankDeposit.save();
            console.log(`   💾 Updated bank deposit to LKR ${bankDeposit.payment?.toLocaleString()}`);
          }
          bankDepositReducedCount++;
        } else {
          console.log(`   ⚠️ No matching bank deposit found`);
        }
      } else {
        // If not deposited, mark as deposited to cancel the pending amount
        console.log(`   📝 Marking as deposited to cancel pending amount`);
        accountEntry.depositedToBank = true;
        accountEntry.depositedAmount = accountEntry.amount;
        accountEntry.bankDepositDate = new Date();
        await accountEntry.save();
        markedAsDepositedCount++;
      }

      // Delete the account data entry
      await AccountData.findByIdAndDelete(accountEntry._id);
      console.log(`   🗑️ Deleted AccountData entry`);
      processedCount++;
    }

    console.log(`\n📈 Summary:`);
    console.log(`   ✅ Processed: ${processedCount} AccountData entries`);
    console.log(`   📉 Bank deposits reduced: ${bankDepositReducedCount}`);
    console.log(`   📝 Marked as deposited: ${markedAsDepositedCount}`);

    console.log('\n🎉 Deleted Advanced Customers Financial Records fix completed successfully!');
    console.log('💡 All orphaned financial records have been properly handled.');

  } catch (error) {
    console.error('❌ Error handling deleted advanced customers:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
};

// Run the script
handleDeletedAdvancedCustomers(); 