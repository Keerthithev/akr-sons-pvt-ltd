const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Import models
const AdvancedCustomer = require('../models/AdvancedCustomer');
const AccountData = require('../models/AccountData');
const BankDeposit = require('../models/BankDeposit');

const checkSarmilanCustomer = async () => {
  try {
    console.log('🔍 Checking Sarmilan Customer Records...\n');

    // Check if Sarmilan exists in AdvancedCustomer
    const sarmilanCustomer = await AdvancedCustomer.findOne({
      customerName: { $regex: /sarmilan/i }
    });

    if (sarmilanCustomer) {
      console.log('✅ Sarmilan Advanced Customer Record Found:');
      console.log(`   Customer Name: ${sarmilanCustomer.customerName}`);
      console.log(`   Coupon ID: ${sarmilanCustomer.couponId}`);
      console.log(`   Bike Model: ${sarmilanCustomer.bikeModel}`);
      console.log(`   Bike Color: ${sarmilanCustomer.bikeColor}`);
      console.log(`   Advance Amount: LKR ${sarmilanCustomer.advanceAmount?.toLocaleString()}`);
      console.log(`   Date: ${sarmilanCustomer.date}`);
    } else {
      console.log('❌ Sarmilan Advanced Customer Record NOT Found');
    }

    // Check AccountData for Sarmilan
    const sarmilanAccountData = await AccountData.find({
      name: { $regex: /sarmilan/i }
    });

    console.log(`\n💰 Sarmilan AccountData Records: ${sarmilanAccountData.length}`);
    
    if (sarmilanAccountData.length > 0) {
      sarmilanAccountData.forEach((entry, index) => {
        console.log(`\n   Record ${index + 1}:`);
        console.log(`   Name: ${entry.name}`);
        console.log(`   Amount: LKR ${entry.amount?.toLocaleString()}`);
        console.log(`   Type: ${entry.type}`);
        console.log(`   Deposited to Bank: ${entry.depositedToBank}`);
        console.log(`   Deposited Amount: LKR ${entry.depositedAmount?.toLocaleString()}`);
        console.log(`   Bank Deposit Date: ${entry.bankDepositDate}`);
        console.log(`   Details: ${entry.details}`);
        console.log(`   Date: ${entry.date}`);
      });
    } else {
      console.log('   ❌ No AccountData records found for Sarmilan');
    }

    // Check BankDeposit for Sarmilan
    const sarmilanBankDeposits = await BankDeposit.find({
      $or: [
        { customerName: { $regex: /sarmilan/i } },
        { description: { $regex: /sarmilan/i } }
      ]
    });

    console.log(`\n🏦 Sarmilan Bank Deposit Records: ${sarmilanBankDeposits.length}`);
    
    if (sarmilanBankDeposits.length > 0) {
      sarmilanBankDeposits.forEach((deposit, index) => {
        console.log(`\n   Record ${index + 1}:`);
        console.log(`   Customer Name: ${deposit.customerName}`);
        console.log(`   Payment: LKR ${deposit.payment?.toLocaleString()}`);
        console.log(`   Transaction Type: ${deposit.transactionType}`);
        console.log(`   Description: ${deposit.description}`);
        console.log(`   Date: ${deposit.date}`);
      });
    } else {
      console.log('   ❌ No Bank Deposit records found for Sarmilan');
    }

    // Check for any advanced customer records with similar amounts
    console.log('\n🔍 Checking for Advanced Customer records with similar amounts...');
    const allAdvancedCustomers = await AdvancedCustomer.find({});
    console.log(`   Total Advanced Customers: ${allAdvancedCustomers.length}`);
    
    allAdvancedCustomers.forEach((customer, index) => {
      console.log(`   ${index + 1}. ${customer.customerName} - LKR ${customer.advanceAmount?.toLocaleString()}`);
    });

    // Check for any AccountData entries with type 'Advanced Customer'
    console.log('\n📊 All Advanced Customer AccountData entries:');
    const allAdvancedCustomerAccountData = await AccountData.find({ type: 'Advanced Customer' });
    console.log(`   Total Advanced Customer AccountData: ${allAdvancedCustomerAccountData.length}`);
    
    allAdvancedCustomerAccountData.forEach((entry, index) => {
      console.log(`   ${index + 1}. ${entry.name} - LKR ${entry.amount?.toLocaleString()} - ${entry.depositedToBank ? 'Deposited' : 'Pending'}`);
    });

    console.log('\n🎯 Summary:');
    if (!sarmilanCustomer && sarmilanAccountData.length === 0 && sarmilanBankDeposits.length === 0) {
      console.log('   ✅ Sarmilan customer and all financial records have been completely removed');
      console.log('   💡 This means the deletion was successful and all records were cleaned up');
    } else if (!sarmilanCustomer) {
      console.log('   ⚠️ Sarmilan customer deleted but some financial records may still exist');
      console.log('   💡 You may need to run the cleanup script to handle remaining records');
    } else {
      console.log('   ❌ Sarmilan customer still exists - deletion may not have been completed');
    }

  } catch (error) {
    console.error('❌ Error checking Sarmilan customer:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
};

// Run the script
checkSarmilanCustomer(); 