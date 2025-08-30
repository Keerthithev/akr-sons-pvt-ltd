const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Import models
const BankDeposit = require('../models/BankDeposit');

const verifySarmilanRefund = async () => {
  try {
    console.log('🔍 Verifying Sarmilan Refund in Bank Deposit...\n');

    // Find Sarmilan's refund entry
    const sarmilanRefund = await BankDeposit.findOne({
      depositerName: 'Sarmilan',
      payment: -303000
    });

    if (sarmilanRefund) {
      console.log('✅ Sarmilan Refund Entry Found:');
      console.log(`   Depositer: ${sarmilanRefund.depositerName}`);
      console.log(`   Amount: LKR ${sarmilanRefund.payment?.toLocaleString()} (Refund)`);
      console.log(`   Transaction Type: ${sarmilanRefund.transactionType}`);
      console.log(`   Description: ${sarmilanRefund.description}`);
      console.log(`   Purpose: ${sarmilanRefund.purpose}`);
      console.log(`   Date: ${sarmilanRefund.date}`);
      console.log(`   ID: ${sarmilanRefund._id}`);
    } else {
      console.log('❌ Sarmilan refund entry not found');
    }

    // Show all outcome transactions (refunds)
    console.log('\n📋 All Outcome Transactions (Refunds):');
    const outcomeTransactions = await BankDeposit.find({
      transactionType: 'outcome'
    }).sort({ date: -1 });

    console.log(`   Total Outcome Transactions: ${outcomeTransactions.length}`);
    
    outcomeTransactions.forEach((transaction, index) => {
      const amountColor = transaction.payment < 0 ? '🔴' : '🟢';
      console.log(`   ${index + 1}. ${amountColor} ${transaction.depositerName || 'N/A'} - LKR ${transaction.payment?.toLocaleString()} - ${transaction.description}`);
    });

    // Show recent bank deposits
    console.log('\n📊 Recent Bank Deposit Entries:');
    const recentDeposits = await BankDeposit.find({})
      .sort({ date: -1 })
      .limit(10);
    
    console.log(`   Total Bank Deposit Entries: ${recentDeposits.length}`);
    
    recentDeposits.forEach((deposit, index) => {
      const amountColor = deposit.payment < 0 ? '🔴' : '🟢';
      const typeIcon = deposit.transactionType === 'outcome' ? '📤' : '📥';
      console.log(`   ${index + 1}. ${typeIcon} ${amountColor} ${deposit.depositerName || 'N/A'} - LKR ${deposit.payment?.toLocaleString()} - ${deposit.transactionType} - ${deposit.description}`);
    });

    console.log('\n🎯 Summary:');
    if (sarmilanRefund) {
      console.log('   ✅ Sarmilan refund entry is properly recorded');
      console.log('   📊 You can see it in the Bank Deposit tab:');
      console.log('      - Filter by "Outcome" to see all refunds');
      console.log('      - The amount shows as LKR -303,000 (negative)');
      console.log('      - Transaction type is "outcome"');
      console.log('   💡 This properly tracks the refund in your financial records');
    } else {
      console.log('   ❌ Sarmilan refund entry not found');
      console.log('   💡 You may need to add the refund entry manually');
    }

  } catch (error) {
    console.error('❌ Error verifying Sarmilan refund:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
};

// Run the script
verifySarmilanRefund(); 