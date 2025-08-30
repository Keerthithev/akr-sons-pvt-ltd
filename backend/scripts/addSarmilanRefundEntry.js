const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Import models
const BankDeposit = require('../models/BankDeposit');

const addSarmilanRefundEntry = async () => {
  try {
    console.log('💰 Adding Sarmilan Refund Entry to Bank Deposit...\n');

    // Create a refund entry in Bank Deposit
    const refundEntry = new BankDeposit({
      date: new Date(),
      depositerName: 'Sarmilan',
      payment: -303000, // Negative amount for refund/outcome
      transactionType: 'outcome',
      description: 'Refund - Advanced Customer Cancellation (Sarmilan)',
      quantity: 1,
      purpose: 'Refund of advance payment for Pulsar NS200 Black pre-booking cancellation'
    });

    await refundEntry.save();
    console.log('✅ Refund entry created successfully:');
    console.log(`   Customer: ${refundEntry.customerName}`);
    console.log(`   Amount: LKR ${refundEntry.payment?.toLocaleString()} (Refund)`);
    console.log(`   Transaction Type: ${refundEntry.transactionType}`);
    console.log(`   Description: ${refundEntry.description}`);
    console.log(`   Date: ${refundEntry.date}`);
    console.log(`   ID: ${refundEntry._id}`);

    // Verify the entry was created
    console.log('\n🔍 Verifying the refund entry...');
    const createdEntry = await BankDeposit.findById(refundEntry._id);
    if (createdEntry) {
      console.log('   ✅ Refund entry found in database');
      console.log('   📊 You can now see this refund in the Bank Deposit tab');
    } else {
      console.log('   ❌ Refund entry not found');
    }

    // Show all recent bank deposits
    console.log('\n📋 Recent Bank Deposit entries:');
    const recentDeposits = await BankDeposit.find({})
      .sort({ date: -1 })
      .limit(5);
    
    recentDeposits.forEach((deposit, index) => {
      const amountColor = deposit.payment < 0 ? '🔴' : '🟢';
      console.log(`   ${index + 1}. ${amountColor} ${deposit.customerName} - LKR ${deposit.payment?.toLocaleString()} - ${deposit.transactionType} - ${deposit.description}`);
    });

    console.log('\n🎉 Sarmilan refund entry added successfully!');
    console.log('💡 You can now see the refund in the Bank Deposit tab:');
    console.log('   - Filter by "Outcome" to see refunds');
    console.log('   - The amount will show as negative (LKR -303,000)');
    console.log('   - This properly tracks the refund in your financial records');

  } catch (error) {
    console.error('❌ Error adding Sarmilan refund entry:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
};

// Run the script
addSarmilanRefundEntry(); 