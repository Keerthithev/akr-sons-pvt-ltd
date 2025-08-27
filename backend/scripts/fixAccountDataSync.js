const mongoose = require('mongoose');
const AccountData = require('../models/AccountData');
const BankDeposit = require('../models/BankDeposit');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/akr-sons', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function fixAccountDataSync() {
  try {
    console.log('🔍 Starting Account Data and Bank Deposit synchronization fix...');
    
    // Step 1: Find all Account Data entries marked as deposited
    const accountDataEntries = await AccountData.find({ 
      depositedToBank: true 
    });
    
    console.log(`📊 Found ${accountDataEntries.length} Account Data entries marked as deposited`);
    
    const results = {
      fixed: [],
      notFound: [],
      errors: []
    };
    
    // Step 2: Check each Account Data entry for corresponding Bank Deposit
    for (const entry of accountDataEntries) {
      try {
        console.log(`\n🔍 Checking: ${entry.name} - ${entry.details} - Amount: ${entry.amount}`);
        
        // Look for corresponding bank deposit with enhanced matching logic
        const bankDeposit = await BankDeposit.findOne({
          $or: [
            {
              purpose: { $regex: entry.details, $options: 'i' },
              $or: [
                { payment: entry.amount }, // Exact match
                { payment: Math.abs(entry.amount) }, // For cheque releases
                { payment: -entry.amount } // For deposits
              ],
              date: entry.date
            },
            {
              depositerName: entry.name,
              $or: [
                { payment: entry.amount }, // Exact match
                { payment: Math.abs(entry.amount) }, // For cheque releases
                { payment: -entry.amount } // For deposits
              ],
              date: entry.date
            }
          ]
        });
        
        if (bankDeposit) {
          console.log(`✅ Found matching bank deposit: ${bankDeposit.purpose} - Amount: ${bankDeposit.payment}`);
          // Update Account Data with correct deposit information
          await AccountData.findByIdAndUpdate(entry._id, {
            depositedToBank: true,
            depositedAmount: bankDeposit.payment,
            bankDepositDate: bankDeposit.date
          });
          
          results.fixed.push({
            id: entry._id,
            name: entry.name,
            details: entry.details,
            amount: entry.amount,
            bankDepositId: bankDeposit._id,
            bankDepositAmount: bankDeposit.payment,
            action: 'Updated with correct bank deposit info'
          });
        } else {
          console.log(`❌ No matching bank deposit found - marking as not deposited`);
          // No corresponding bank deposit found, mark as not deposited
          await AccountData.findByIdAndUpdate(entry._id, {
            depositedToBank: false,
            depositedAmount: 0,
            bankDepositDate: null
          });
          
          results.notFound.push({
            id: entry._id,
            name: entry.name,
            details: entry.details,
            amount: entry.amount,
            action: 'Marked as not deposited (no bank deposit found)'
          });
        }
      } catch (error) {
        console.error(`❌ Error processing entry ${entry._id}:`, error.message);
        results.errors.push({
          id: entry._id,
          name: entry.name,
          error: error.message
        });
      }
    }
    
    // Step 3: Check for orphaned bank deposits (bank deposits without corresponding Account Data)
    console.log('\n🔍 Checking for orphaned bank deposits...');
    
    const bankDeposits = await BankDeposit.find();
    console.log(`📊 Found ${bankDeposits.length} bank deposits`);
    
    const orphanedDeposits = [];
    
    for (const deposit of bankDeposits) {
      try {
        const accountData = await AccountData.findOne({
          $or: [
            {
              details: { $regex: deposit.purpose, $options: 'i' },
              $or: [
                { amount: deposit.payment },
                { amount: Math.abs(deposit.payment) },
                { amount: -deposit.payment }
              ],
              date: deposit.date
            },
            {
              name: deposit.depositerName,
              $or: [
                { amount: deposit.payment },
                { amount: Math.abs(deposit.payment) },
                { amount: -deposit.payment }
              ],
              date: deposit.date
            }
          ]
        });
        
        if (!accountData) {
          orphanedDeposits.push({
            id: deposit._id,
            purpose: deposit.purpose,
            depositerName: deposit.depositerName,
            payment: deposit.payment,
            date: deposit.date,
            action: 'No corresponding Account Data found'
          });
        }
      } catch (error) {
        console.error(`❌ Error checking bank deposit ${deposit._id}:`, error.message);
      }
    }
    
    // Step 4: Summary Report
    console.log('\n📋 SYNC FIX SUMMARY REPORT');
    console.log('='.repeat(50));
    console.log(`✅ Fixed/Updated: ${results.fixed.length} entries`);
    console.log(`❌ Marked as not deposited: ${results.notFound.length} entries`);
    console.log(`⚠️ Errors: ${results.errors.length} entries`);
    console.log(`🔍 Orphaned bank deposits: ${orphanedDeposits.length} entries`);
    
    if (results.fixed.length > 0) {
      console.log('\n✅ FIXED ENTRIES:');
      results.fixed.forEach((item, index) => {
        console.log(`${index + 1}. ${item.name} - ${item.details} - Amount: ${item.amount}`);
      });
    }
    
    if (results.notFound.length > 0) {
      console.log('\n❌ NOT DEPOSITED ENTRIES:');
      results.notFound.forEach((item, index) => {
        console.log(`${index + 1}. ${item.name} - ${item.details} - Amount: ${item.amount}`);
      });
    }
    
    if (orphanedDeposits.length > 0) {
      console.log('\n🔍 ORPHANED BANK DEPOSITS:');
      orphanedDeposits.forEach((item, index) => {
        console.log(`${index + 1}. ${item.depositerName} - ${item.purpose} - Amount: ${item.payment}`);
      });
    }
    
    if (results.errors.length > 0) {
      console.log('\n⚠️ ERRORS:');
      results.errors.forEach((item, index) => {
        console.log(`${index + 1}. ${item.name} - Error: ${item.error}`);
      });
    }
    
    console.log('\n🎉 Account Data synchronization fix completed!');
    
    return {
      success: true,
      summary: {
        fixed: results.fixed.length,
        notDeposited: results.notFound.length,
        errors: results.errors.length,
        orphanedDeposits: orphanedDeposits.length
      },
      details: {
        fixed: results.fixed,
        notFound: results.notFound,
        errors: results.errors,
        orphanedDeposits
      }
    };
    
  } catch (error) {
    console.error('❌ Error in Account Data sync fix:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the script if called directly
if (require.main === module) {
  fixAccountDataSync()
    .then(result => {
      console.log('✅ Script completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

module.exports = fixAccountDataSync; 