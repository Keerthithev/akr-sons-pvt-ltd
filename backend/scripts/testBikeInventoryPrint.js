const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Vehicle = require('../models/Vehicle.cjs');
const BikeInventory = require('../models/BikeInventory');

dotenv.config({ path: './.env' });

async function testBikeInventoryPrint() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('🔗 Connected to MongoDB');
    console.log('='.repeat(60));

    console.log('🧪 TESTING BIKE INVENTORY PRINT FUNCTIONALITY');
    console.log('='.repeat(60));

    // Test 1: Check current bike inventory structure
    console.log('\n📊 CURRENT BIKE INVENTORY STRUCTURE:');
    const currentBikes = await BikeInventory.find().limit(3);
    if (currentBikes.length > 0) {
      const sampleBike = currentBikes[0];
      console.log('Sample Bike Record:');
      console.log(`  - Date: ${sampleBike.date}`);
      console.log(`  - Bike ID: ${sampleBike.bikeId}`);
      console.log(`  - Branch: ${sampleBike.branch}`);
      console.log(`  - Category: ${sampleBike.category}`);
      console.log(`  - Model: ${sampleBike.model}`);
      console.log(`  - Color: ${sampleBike.color}`);
      console.log(`  - Engine No: ${sampleBike.engineNo}`);
      console.log(`  - Chassis Number: ${sampleBike.chassisNumber}`);
    }

    // Test 2: Verify required fields for print
    console.log('\n📋 VERIFYING REQUIRED FIELDS FOR PRINT:');
    const requiredFields = ['date', 'bikeId', 'branch', 'category', 'model', 'color', 'engineNo', 'chassisNumber'];
    const missingFields = [];
    
    for (const field of requiredFields) {
      const bikesWithField = await BikeInventory.countDocuments({ [field]: { $exists: true, $ne: '' } });
      const totalBikes = await BikeInventory.countDocuments();
      console.log(`  - ${field}: ${bikesWithField}/${totalBikes} bikes have this field`);
      
      if (bikesWithField < totalBikes) {
        missingFields.push(field);
      }
    }

    if (missingFields.length > 0) {
      console.log(`⚠️ Missing fields: ${missingFields.join(', ')}`);
    } else {
      console.log('✅ All required fields are present');
    }

    // Test 3: Test date filtering for print
    console.log('\n📅 TESTING DATE FILTERING FOR PRINT:');
    const now = new Date();
    
    // Today
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const todayBikes = await BikeInventory.find({
      date: { $gte: todayStart, $lt: todayEnd }
    });
    console.log(`Today: ${todayBikes.length} bikes`);

    // Last 7 days
    const last7DaysStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last7DaysEnd = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const last7DaysBikes = await BikeInventory.find({
      date: { $gte: last7DaysStart, $lt: last7DaysEnd }
    });
    console.log(`Last 7 days: ${last7DaysBikes.length} bikes`);

    // Last 30 days
    const last30DaysStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const last30DaysEnd = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const last30DaysBikes = await BikeInventory.find({
      date: { $gte: last30DaysStart, $lt: last30DaysEnd }
    });
    console.log(`Last 30 days: ${last30DaysBikes.length} bikes`);

    // Test 4: Simulate print statistics calculation
    console.log('\n📊 SIMULATING PRINT STATISTICS:');
    const allBikes = await BikeInventory.find();
    
    const newBikes30Days = allBikes.filter(bike => 
      new Date(bike.date) >= new Date(new Date().setDate(new Date().getDate() - 30))
    ).length;
    
    const newBikes7Days = allBikes.filter(bike => 
      new Date(bike.date) >= new Date(new Date().setDate(new Date().getDate() - 7))
    ).length;
    
    const newBikesToday = allBikes.filter(bike => 
      new Date(bike.date).toDateString() === new Date().toDateString()
    ).length;
    
    const totalBikes = allBikes.length;
    
    console.log(`  - New Bikes (Last 30 Days): ${newBikes30Days}`);
    console.log(`  - New Bikes (Last 7 Days): ${newBikes7Days}`);
    console.log(`  - New Bikes (Today): ${newBikesToday}`);
    console.log(`  - Total Bikes in Inventory: ${totalBikes}`);

    // Test 5: Verify table structure for print
    console.log('\n📋 VERIFYING TABLE STRUCTURE FOR PRINT:');
    const expectedColumns = [
      'No', 'Date', 'Bike ID', 'Branch', 'Category', 'Model', 'Color', 'Engine No', 'Chassis Number'
    ];
    
    console.log('Expected columns for print:');
    expectedColumns.forEach((col, index) => {
      console.log(`  ${index + 1}. ${col}`);
    });

    // Test 6: Check if any bikes have the old fields that were removed
    console.log('\n🔍 CHECKING FOR OLD FIELDS (should be empty):');
    const bikesWithStockQty = await BikeInventory.countDocuments({ stockQuantity: { $exists: true, $ne: 0 } });
    const bikesWithCostPrice = await BikeInventory.countDocuments({ unitCostPrice: { $exists: true, $ne: 0 } });
    const bikesWithSellingPrice = await BikeInventory.countDocuments({ sellingPrice: { $exists: true, $ne: 0 } });
    
    console.log(`  - Bikes with Stock Quantity: ${bikesWithStockQty}`);
    console.log(`  - Bikes with Cost Price: ${bikesWithCostPrice}`);
    console.log(`  - Bikes with Selling Price: ${bikesWithSellingPrice}`);

    if (bikesWithStockQty === 0 && bikesWithCostPrice === 0 && bikesWithSellingPrice === 0) {
      console.log('✅ All old fields are properly removed');
    } else {
      console.log('⚠️ Some old fields still exist');
    }

    console.log('\n🎉 BIKE INVENTORY PRINT TEST COMPLETED!');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the test
testBikeInventoryPrint(); 