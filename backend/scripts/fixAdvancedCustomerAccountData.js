const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Import models
const AdvancedCustomer = require('../models/AdvancedCustomer');
const AccountData = require('../models/AccountData');

const fixAdvancedCustomerAccountData = async () => {
  try {
    console.log('🔧 Starting Advanced Customer Account Data Fix...\n');

    // Get all advanced customers
    const advancedCustomers = await AdvancedCustomer.find({});
    console.log(`📊 Found ${advancedCustomers.length} advanced customers\n`);

    let createdCount = 0;
    let updatedCount = 0;

    for (const customer of advancedCustomers) {
      console.log(`\n👤 Processing: ${customer.customerName} (${customer.couponId})`);
      console.log(`   Advance Amount: LKR ${customer.advanceAmount?.toLocaleString() || 0}`);

      // Check if AccountData entry already exists
      const existingAccountData = await AccountData.findOne({
        type: 'Advanced Customer',
        name: customer.customerName,
        amount: customer.advanceAmount
      });

      if (existingAccountData) {
        console.log(`   ✅ AccountData entry already exists (ID: ${existingAccountData._id})`);
        updatedCount++;
      } else {
        // Create new AccountData entry
        const accountDataEntry = new AccountData({
          date: customer.date || new Date(),
          name: customer.customerName,
          model: customer.bikeModel,
          amount: customer.advanceAmount || 0,
          type: 'Advanced Customer',
          details: `Advanced Customer Pre-booking - ${customer.bikeModel} ${customer.bikeColor}`,
          depositedToBank: false, // Default to not deposited
          depositedAmount: 0,
          bankDepositDate: null,
          remarks: `Advance payment for ${customer.bikeModel} pre-booking`
        });

        await accountDataEntry.save();
        console.log(`   ✅ Created new AccountData entry (ID: ${accountDataEntry._id})`);
        createdCount++;
      }
    }

    console.log(`\n📈 Summary:`);
    console.log(`   ✅ Created: ${createdCount} new AccountData entries`);
    console.log(`   ✅ Updated: ${updatedCount} existing entries`);
    console.log(`   📊 Total processed: ${advancedCustomers.length} customers`);

    // Show some examples
    console.log(`\n📋 Sample AccountData entries created:`);
    const sampleEntries = await AccountData.find({ type: 'Advanced Customer' }).limit(5);
    sampleEntries.forEach(entry => {
      console.log(`   • ${entry.customerName} - LKR ${entry.amount?.toLocaleString()} - ${entry.depositedToBank ? 'Deposited' : 'Pending'}`);
    });

    console.log('\n🎉 Advanced Customer Account Data fix completed successfully!');
    console.log('💡 Now when you delete advanced customers, the financial records will be properly handled.');

  } catch (error) {
    console.error('❌ Error fixing advanced customer account data:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
};

// Run the script
fixAdvancedCustomerAccountData(); 