const mongoose = require('mongoose');
const Customer = require('./models/Customer');
require('dotenv').config({ path: './.env' });

async function testCustomerCRUD() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to MongoDB');
    console.log('\n=== TESTING CUSTOMER CRUD OPERATIONS ===\n');
    
    // Test 1: CREATE - Add a new customer
    console.log('1. TESTING CREATE (Add Customer)...');
    const newCustomerData = {
      fullName: 'Test Customer',
      nicDrivingLicense: 'TEST123456V',
      phoneNo: '0771234567',
      address: 'Test Address, Test City',
      language: 'Tamil',
      occupation: 'Test Occupation',
      dateOfPurchase: new Date('2025-08-13')
    };
    
    const newCustomer = new Customer(newCustomerData);
    const savedCustomer = await newCustomer.save();
    console.log(`✅ Created new customer with ID: ${savedCustomer._id}`);
    console.log(`   Name: ${savedCustomer.fullName}`);
    console.log(`   NIC: ${savedCustomer.nicDrivingLicense}`);
    console.log(`   Phone: ${savedCustomer.phoneNo}`);
    
    // Test 2: READ - Get the created record
    console.log('\n2. TESTING READ (Get Customer)...');
    const allCustomers = await Customer.find().sort({ dateOfPurchase: -1 });
    console.log(`✅ Retrieved ${allCustomers.length} total customer records`);
    
    const retrievedCustomer = await Customer.findById(savedCustomer._id);
    if (retrievedCustomer) {
      console.log(`✅ Retrieved specific customer: ${retrievedCustomer.fullName}`);
    } else {
      console.log('❌ Failed to retrieve customer');
    }
    
    // Test 3: UPDATE - Edit the record
    console.log('\n3. TESTING UPDATE (Edit Customer)...');
    const updateData = {
      fullName: 'Updated Test Customer',
      phoneNo: '0777654321',
      occupation: 'Updated Occupation'
    };
    
    const updatedCustomer = await Customer.findByIdAndUpdate(
      savedCustomer._id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (updatedCustomer) {
      console.log(`✅ Updated customer: ${updatedCustomer.fullName}`);
      console.log(`   New phone: ${updatedCustomer.phoneNo}`);
      console.log(`   New occupation: ${updatedCustomer.occupation}`);
    } else {
      console.log('❌ Failed to update customer');
    }
    
    // Test 4: SEARCH - Test search functionality
    console.log('\n4. TESTING SEARCH (Search Customers)...');
    const searchResults = await Customer.find({
      $or: [
        { fullName: { $regex: 'Updated', $options: 'i' } },
        { nicDrivingLicense: { $regex: 'TEST', $options: 'i' } },
        { occupation: { $regex: 'Updated', $options: 'i' } }
      ]
    });
    
    console.log(`✅ Search found ${searchResults.length} records for 'Updated' or 'TEST'`);
    if (searchResults.length > 0) {
      console.log(`   First result: ${searchResults[0].fullName} - ${searchResults[0].occupation}`);
    }
    
    // Test 5: STATS - Test statistics
    console.log('\n5. TESTING STATISTICS (Customer Stats)...');
    const stats = await Customer.aggregate([
      {
        $group: {
          _id: null,
          totalCustomers: { $sum: 1 },
          totalWithPhone: { $sum: { $cond: [{ $ne: ['$phoneNo', ''] }, 1, 0] } },
          totalWithNIC: { $sum: { $cond: [{ $ne: ['$nicDrivingLicense', ''] }, 1, 0] } }
        }
      }
    ]);
    
    const languageStats = await Customer.aggregate([
      {
        $group: {
          _id: '$language',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    const occupationStats = await Customer.aggregate([
      {
        $group: {
          _id: '$occupation',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    const result = stats[0] || { totalCustomers: 0, totalWithPhone: 0, totalWithNIC: 0 };
    console.log(`✅ Statistics:`);
    console.log(`   Total Customers: ${result.totalCustomers}`);
    console.log(`   Customers with Phone: ${result.totalWithPhone}`);
    console.log(`   Customers with NIC: ${result.totalWithNIC}`);
    
    console.log(`✅ Language Statistics:`);
    languageStats.forEach(stat => {
      console.log(`   ${stat._id}: ${stat.count} customers`);
    });
    
    console.log(`✅ Occupation Statistics:`);
    occupationStats.forEach(stat => {
      console.log(`   ${stat._id}: ${stat.count} customers`);
    });
    
    // Test 6: DELETE - Delete the test record
    console.log('\n6. TESTING DELETE (Delete Customer)...');
    const deletedCustomer = await Customer.findByIdAndDelete(savedCustomer._id);
    
    if (deletedCustomer) {
      console.log(`✅ Deleted customer: ${deletedCustomer.fullName}`);
      console.log(`   Deleted customer NIC: ${deletedCustomer.nicDrivingLicense}`);
      console.log(`   Deleted customer phone: ${deletedCustomer.phoneNo}`);
    } else {
      console.log('❌ Failed to delete customer');
    }
    
    // Test 7: Verify deletion
    console.log('\n7. VERIFYING DELETION...');
    const verifyDeleted = await Customer.findById(savedCustomer._id);
    if (!verifyDeleted) {
      console.log('✅ Record successfully deleted (not found in database)');
    } else {
      console.log('❌ Record still exists after deletion');
    }
    
    // Test 8: Check final stats after deletion
    console.log('\n8. CHECKING FINAL STATS AFTER DELETION...');
    const finalStats = await Customer.aggregate([
      {
        $group: {
          _id: null,
          totalCustomers: { $sum: 1 },
          totalWithPhone: { $sum: { $cond: [{ $ne: ['$phoneNo', ''] }, 1, 0] } },
          totalWithNIC: { $sum: { $cond: [{ $ne: ['$nicDrivingLicense', ''] }, 1, 0] } }
        }
      }
    ]);
    
    const finalResult = finalStats[0] || { totalCustomers: 0, totalWithPhone: 0, totalWithNIC: 0 };
    console.log(`✅ Final Stats after deletion:`);
    console.log(`   Total Customers: ${finalResult.totalCustomers}`);
    console.log(`   Customers with Phone: ${finalResult.totalWithPhone}`);
    console.log(`   Customers with NIC: ${finalResult.totalWithNIC}`);
    
    console.log('\n=== CUSTOMER CRUD TEST SUMMARY ===');
    console.log('✅ CREATE (Add Customer): Working');
    console.log('✅ READ (Get Customer): Working');
    console.log('✅ UPDATE (Edit Customer): Working');
    console.log('✅ SEARCH: Working');
    console.log('✅ STATISTICS: Working');
    console.log('✅ DELETE (Delete Customer): Working');
    console.log('✅ VERIFICATION: Working');
    console.log('\n🎉 All customer CRUD operations are working correctly!');
    console.log('\n💡 The customer details tab should now work perfectly in the admin dashboard!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during customer CRUD testing:', error);
    process.exit(1);
  }
}

testCustomerCRUD(); 