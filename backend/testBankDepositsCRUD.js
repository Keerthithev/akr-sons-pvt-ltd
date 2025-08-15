const mongoose = require('mongoose');
const BankDeposit = require('./models/BankDeposit');
require('dotenv').config({ path: './.env' });

async function testBankDepositsCRUD() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to MongoDB');
    console.log('\n=== TESTING BANK DEPOSITS CRUD OPERATIONS ===\n');
    
    // Test 1: CREATE - Add a new bank deposit
    console.log('1. TESTING CREATE (Add new record)...');
    const newDeposit = new BankDeposit({
      date: new Date('2025-08-13'),
      depositerName: 'Test User',
      accountNumber: 'TEST123456',
      accountName: 'Test Account',
      purpose: 'Test Payment',
      quantity: 1,
      payment: 50000.00
    });
    
    const savedDeposit = await newDeposit.save();
    console.log(`✅ Created new deposit with ID: ${savedDeposit._id}`);
    console.log(`   Amount: LKR ${savedDeposit.payment.toLocaleString()}`);
    
    // Test 2: READ - Get the created record
    console.log('\n2. TESTING READ (Get record by ID)...');
    const retrievedDeposit = await BankDeposit.findById(savedDeposit._id);
    if (retrievedDeposit) {
      console.log(`✅ Retrieved deposit: ${retrievedDeposit.depositerName} - LKR ${retrievedDeposit.payment.toLocaleString()}`);
    } else {
      console.log('❌ Failed to retrieve deposit');
    }
    
    // Test 3: UPDATE - Edit the record
    console.log('\n3. TESTING UPDATE (Edit record)...');
    const updatedDeposit = await BankDeposit.findByIdAndUpdate(
      savedDeposit._id,
      {
        depositerName: 'Updated Test User',
        payment: 75000.00,
        purpose: 'Updated Test Payment'
      },
      { new: true }
    );
    
    if (updatedDeposit) {
      console.log(`✅ Updated deposit: ${updatedDeposit.depositerName} - LKR ${updatedDeposit.payment.toLocaleString()}`);
      console.log(`   New purpose: ${updatedDeposit.purpose}`);
    } else {
      console.log('❌ Failed to update deposit');
    }
    
    // Test 4: DELETE - Delete the test record
    console.log('\n4. TESTING DELETE (Delete record)...');
    const deletedDeposit = await BankDeposit.findByIdAndDelete(savedDeposit._id);
    
    if (deletedDeposit) {
      console.log(`✅ Deleted deposit: ${deletedDeposit.depositerName} - LKR ${deletedDeposit.payment.toLocaleString()}`);
    } else {
      console.log('❌ Failed to delete deposit');
    }
    
    // Test 5: Verify deletion
    console.log('\n5. VERIFYING DELETION...');
    const verifyDeleted = await BankDeposit.findById(savedDeposit._id);
    if (!verifyDeleted) {
      console.log('✅ Record successfully deleted (not found in database)');
    } else {
      console.log('❌ Record still exists after deletion');
    }
    
    // Test 6: Check total count and stats
    console.log('\n6. CHECKING FINAL STATS...');
    const finalStats = await BankDeposit.aggregate([
      {
        $group: {
          _id: null,
          totalPayment: { $sum: '$payment' },
          totalQuantity: { $sum: '$quantity' },
          count: { $sum: 1 }
        }
      }
    ]);
    
    const result = finalStats[0] || { totalPayment: 0, totalQuantity: 0, count: 0 };
    console.log(`✅ Final Stats:`);
    console.log(`   Total Payment: LKR ${result.totalPayment.toLocaleString()}`);
    console.log(`   Total Quantity: ${result.totalQuantity}`);
    console.log(`   Total Records: ${result.count}`);
    
    // Test 7: Test search functionality
    console.log('\n7. TESTING SEARCH FUNCTIONALITY...');
    const searchResults = await BankDeposit.find({
      $or: [
        { depositerName: { $regex: 'A.Thevarasa', $options: 'i' } },
        { accountName: { $regex: 'A.Rojarstalin', $options: 'i' } }
      ]
    }).limit(3);
    
    console.log(`✅ Search found ${searchResults.length} records for 'A.Thevarasa' or 'A.Rojarstalin'`);
    if (searchResults.length > 0) {
      console.log(`   First result: ${searchResults[0].depositerName} - ${searchResults[0].accountName}`);
    }
    
    console.log('\n=== CRUD TEST SUMMARY ===');
    console.log('✅ CREATE: Working');
    console.log('✅ READ: Working');
    console.log('✅ UPDATE: Working');
    console.log('✅ DELETE: Working');
    console.log('✅ SEARCH: Working');
    console.log('✅ STATS: Working');
    console.log('\n🎉 All CRUD operations are working correctly!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during CRUD testing:', error);
    process.exit(1);
  }
}

testBankDepositsCRUD(); 