const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Vehicle = require('../models/Vehicle.cjs');
const BikeInventory = require('../models/BikeInventory');

dotenv.config({ path: './.env' });

async function testBikeInventoryCategory() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('🔗 Connected to MongoDB');
    console.log('='.repeat(60));

    console.log('🧪 TESTING BIKE INVENTORY CATEGORY');
    console.log('='.repeat(60));

    // Test 1: Check current bike inventory
    console.log('\n📊 CURRENT BIKE INVENTORY:');
    const currentBikes = await BikeInventory.find();
    currentBikes.forEach(bike => {
      console.log(`  - ${bike.model} (Category: ${bike.category || 'Missing'})`);
    });

    // Test 2: Create a test bike inventory with category
    console.log('\n📝 CREATING TEST BIKE INVENTORY:');
    const testBikeData = {
      date: new Date(),
      bikeId: 'TEST-CATEGORY-001',
      branch: 'Test Branch',
      brand: 'Bajaj',
      category: 'Pulsar', // This should be auto-filled
      model: 'Pulsar NS200',
      color: 'Blue',
      engineNo: 'TEST-ENG-001',
      chassisNumber: 'TEST-CHS-001',
      stockQuantity: 1,
      unitCostPrice: 911960,
      sellingPrice: 1139950
    };

    const testBike = new BikeInventory(testBikeData);
    const savedBike = await testBike.save();
    console.log(`✅ Created test bike: ${savedBike.model} (Category: ${savedBike.category})`);

    // Test 3: Verify the category was saved
    console.log('\n📊 VERIFICATION:');
    const savedBikeCheck = await BikeInventory.findById(savedBike._id);
    console.log(`Model: ${savedBikeCheck.model}`);
    console.log(`Category: ${savedBikeCheck.category}`);
    console.log(`Brand: ${savedBikeCheck.brand}`);

    // Test 4: Update the bike inventory
    console.log('\n📝 UPDATING TEST BIKE:');
    const updatedBike = await BikeInventory.findByIdAndUpdate(
      savedBike._id,
      { 
        model: 'Discover 125 DRL',
        category: 'Discover' // This should be auto-filled
      },
      { new: true }
    );
    console.log(`✅ Updated bike: ${updatedBike.model} (Category: ${updatedBike.category})`);

    // Test 5: Clean up - delete test bike
    console.log('\n🗑️ CLEANING UP:');
    await BikeInventory.findByIdAndDelete(savedBike._id);
    console.log('✅ Test bike deleted');

    // Test 6: Check final state
    console.log('\n📊 FINAL BIKE INVENTORY:');
    const finalBikes = await BikeInventory.find();
    finalBikes.forEach(bike => {
      console.log(`  - ${bike.model} (Category: ${bike.category || 'Missing'})`);
    });

    console.log('\n🎉 BIKE INVENTORY CATEGORY TEST COMPLETED!');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the test
testBikeInventoryCategory(); 