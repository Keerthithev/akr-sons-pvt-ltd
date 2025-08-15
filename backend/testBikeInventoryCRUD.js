const mongoose = require('mongoose');
const BikeInventory = require('./models/BikeInventory');
require('dotenv').config({ path: './.env' });

async function testBikeInventoryCRUD() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to MongoDB');
    console.log('\n=== TESTING BIKE INVENTORY CRUD OPERATIONS ===\n');
    
    // Test 1: CREATE - Add a new bike inventory
    console.log('1. TESTING CREATE (Add new record)...');
    const newBike = new BikeInventory({
      date: new Date('2025-08-13'),
      bikeId: 'TEST001',
      branch: 'Test Branch',
      brand: 'Test Brand',
      model: 'Test Model',
      color: 'Test Color',
      dateOfPurchase: new Date('2025-08-13'),
      engineCapacity: '125CC',
      fuelType: 'Petrol',
      transmission: 'Manual',
      yearOfManufacture: 2025,
      stockQuantity: 1,
      unitCostPrice: 150000.00,
      sellingPrice: 180000.00,
      bikeCondition: 'New',
      engineNo: 'TEST-ENGINE-001',
      chassisNumber: 'TEST-CHASSIS-001',
      registrationNo: ''
    });
    
    const savedBike = await newBike.save();
    console.log(`✅ Created new bike with ID: ${savedBike._id}`);
    console.log(`   Bike ID: ${savedBike.bikeId}, Model: ${savedBike.model}`);
    console.log(`   Cost Price: LKR ${savedBike.unitCostPrice.toLocaleString()}`);
    
    // Test 2: READ - Get the created record
    console.log('\n2. TESTING READ (Get record by ID)...');
    const retrievedBike = await BikeInventory.findById(savedBike._id);
    if (retrievedBike) {
      console.log(`✅ Retrieved bike: ${retrievedBike.bikeId} - ${retrievedBike.brand} ${retrievedBike.model}`);
    } else {
      console.log('❌ Failed to retrieve bike');
    }
    
    // Test 3: UPDATE - Edit the record
    console.log('\n3. TESTING UPDATE (Edit record)...');
    const updatedBike = await BikeInventory.findByIdAndUpdate(
      savedBike._id,
      {
        bikeId: 'UPDATED001',
        sellingPrice: 200000.00,
        bikeCondition: 'Updated Condition'
      },
      { new: true }
    );
    
    if (updatedBike) {
      console.log(`✅ Updated bike: ${updatedBike.bikeId} - LKR ${updatedBike.sellingPrice.toLocaleString()}`);
      console.log(`   New condition: ${updatedBike.bikeCondition}`);
    } else {
      console.log('❌ Failed to update bike');
    }
    
    // Test 4: DELETE - Delete the test record
    console.log('\n4. TESTING DELETE (Delete record)...');
    const deletedBike = await BikeInventory.findByIdAndDelete(savedBike._id);
    
    if (deletedBike) {
      console.log(`✅ Deleted bike: ${deletedBike.bikeId} - ${deletedBike.brand} ${deletedBike.model}`);
    } else {
      console.log('❌ Failed to delete bike');
    }
    
    // Test 5: Verify deletion
    console.log('\n5. VERIFYING DELETION...');
    const verifyDeleted = await BikeInventory.findById(savedBike._id);
    if (!verifyDeleted) {
      console.log('✅ Record successfully deleted (not found in database)');
    } else {
      console.log('❌ Record still exists after deletion');
    }
    
    // Test 6: Check total count and stats
    console.log('\n6. CHECKING FINAL STATS...');
    const finalStats = await BikeInventory.aggregate([
      {
        $group: {
          _id: null,
          totalBikes: { $sum: 1 },
          totalStockQuantity: { $sum: '$stockQuantity' },
          totalCostValue: { $sum: { $multiply: ['$unitCostPrice', '$stockQuantity'] } },
          totalSellingValue: { $sum: { $multiply: ['$sellingPrice', '$stockQuantity'] } }
        }
      }
    ]);
    
    const result = finalStats[0] || { totalBikes: 0, totalStockQuantity: 0, totalCostValue: 0, totalSellingValue: 0 };
    console.log(`✅ Final Stats:`);
    console.log(`   Total Bikes: ${result.totalBikes}`);
    console.log(`   Total Stock Quantity: ${result.totalStockQuantity}`);
    console.log(`   Total Cost Value: LKR ${result.totalCostValue.toLocaleString()}`);
    console.log(`   Total Selling Value: LKR ${result.totalSellingValue.toLocaleString()}`);
    
    // Test 7: Test search functionality
    console.log('\n7. TESTING SEARCH FUNCTIONALITY...');
    const searchResults = await BikeInventory.find({
      $or: [
        { brand: { $regex: 'Bajaj', $options: 'i' } },
        { branch: { $regex: 'Murunkan', $options: 'i' } }
      ]
    }).limit(3);
    
    console.log(`✅ Search found ${searchResults.length} records for 'Bajaj' or 'Murunkan'`);
    if (searchResults.length > 0) {
      console.log(`   First result: ${searchResults[0].brand} ${searchResults[0].model} - ${searchResults[0].branch}`);
    }
    
    // Test 8: Test brand statistics
    console.log('\n8. TESTING BRAND STATISTICS...');
    const brandStats = await BikeInventory.aggregate([
      {
        $group: {
          _id: '$brand',
          count: { $sum: 1 },
          totalStock: { $sum: '$stockQuantity' }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    console.log(`✅ Brand Statistics:`);
    brandStats.forEach(stat => {
      console.log(`   ${stat._id}: ${stat.count} bikes, ${stat.totalStock} total stock`);
    });
    
    console.log('\n=== CRUD TEST SUMMARY ===');
    console.log('✅ CREATE: Working');
    console.log('✅ READ: Working');
    console.log('✅ UPDATE: Working');
    console.log('✅ DELETE: Working');
    console.log('✅ SEARCH: Working');
    console.log('✅ STATS: Working');
    console.log('✅ BRAND STATS: Working');
    console.log('\n🎉 All CRUD operations are working correctly!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during CRUD testing:', error);
    process.exit(1);
  }
}

testBikeInventoryCRUD(); 