const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Vehicle = require('../models/Vehicle.cjs');
const BikeInventory = require('../models/BikeInventory');

dotenv.config({ path: './.env' });

async function testBikeIdAutoIncrement() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('🔗 Connected to MongoDB');
    console.log('='.repeat(60));

    console.log('🧪 TESTING BIKE ID AUTO-INCREMENT FUNCTIONALITY');
    console.log('='.repeat(60));

    // Test 1: Check current bike IDs
    console.log('\n📊 CURRENT BIKE IDs:');
    const currentBikes = await BikeInventory.find().sort({ bikeId: 1 });
    currentBikes.forEach(bike => {
      console.log(`  - Bike ID: ${bike.bikeId} | Model: ${bike.model}`);
    });

    // Test 2: Test auto-increment logic
    console.log('\n🧪 TESTING AUTO-INCREMENT LOGIC:');
    
    // Get all bike IDs and find the highest numeric value
    const allBikes = await BikeInventory.find({}, 'bikeId');
    let maxBikeId = 0;
    
    allBikes.forEach(bike => {
      if (bike.bikeId) {
        const bikeIdStr = bike.bikeId.toString();
        const numericPart = parseInt(bikeIdStr.match(/\d+/)?.[0] || '0');
        if (numericPart > maxBikeId) {
          maxBikeId = numericPart;
        }
      }
    });
    
    const nextBikeId = maxBikeId + 1;
    console.log(`  - Highest Bike ID found: ${maxBikeId}`);
    console.log(`  - Next Bike ID: ${nextBikeId}`);

    // Test 3: Create test bikes with auto-generated IDs
    console.log('\n📝 CREATING TEST BIKES WITH AUTO-GENERATED IDs:');
    
    const testBikes = [
      {
        date: new Date(),
        branch: 'Test Branch',
        brand: 'Bajaj',
        category: 'CT 100',
        model: 'CT 100 ES',
        color: 'Blue',
        engineNo: 'AUTO-TEST-ENG-001',
        chassisNumber: 'AUTO-TEST-CHS-001'
      },
      {
        date: new Date(),
        branch: 'Test Branch',
        brand: 'Bajaj',
        category: 'Discover',
        model: 'Discover 125 DRL',
        color: 'Red',
        engineNo: 'AUTO-TEST-ENG-002',
        chassisNumber: 'AUTO-TEST-CHS-002'
      },
      {
        date: new Date(),
        branch: 'Test Branch',
        brand: 'Bajaj',
        category: 'CT 100',
        model: 'CT 100 ES',
        color: 'Black',
        engineNo: 'AUTO-TEST-ENG-003',
        chassisNumber: 'AUTO-TEST-CHS-003'
      }
    ];

    const savedBikes = [];
    for (const bikeData of testBikes) {
      // Simulate the auto-increment logic
      const allBikesForTest = await BikeInventory.find({}, 'bikeId');
      let maxBikeId = 0;
      
      allBikesForTest.forEach(bike => {
        if (bike.bikeId) {
          const bikeIdStr = bike.bikeId.toString();
          const numericPart = parseInt(bikeIdStr.match(/\d+/)?.[0] || '0');
          if (numericPart > maxBikeId) {
            maxBikeId = numericPart;
          }
        }
      });
      
      const nextId = maxBikeId + 1;
      bikeData.bikeId = nextId.toString();
      
      const bike = new BikeInventory(bikeData);
      const savedBike = await bike.save();
      savedBikes.push(savedBike);
      console.log(`✅ Created: Bike ID ${savedBike.bikeId} | Model: ${savedBike.model}`);
    }

    // Test 4: Verify sequential IDs
    console.log('\n📋 VERIFYING SEQUENTIAL IDs:');
    const allBikesForVerification = await BikeInventory.find().sort({ bikeId: 1 });
    const bikeIds = allBikesForVerification.map(bike => parseInt(bike.bikeId));
    
    console.log('All Bike IDs (sorted):', bikeIds);
    
    // Check if IDs are sequential
    let isSequential = true;
    for (let i = 1; i < bikeIds.length; i++) {
      if (bikeIds[i] !== bikeIds[i-1] + 1) {
        isSequential = false;
        console.log(`⚠️ Gap found: ${bikeIds[i-1]} -> ${bikeIds[i]}`);
      }
    }
    
    if (isSequential) {
      console.log('✅ All Bike IDs are sequential!');
    } else {
      console.log('❌ Bike IDs are not sequential');
    }

    // Test 5: Test with existing numeric IDs
    console.log('\n🧪 TESTING WITH EXISTING NUMERIC IDs:');
    
    // Create a bike with a specific numeric ID
    const specificBike = new BikeInventory({
      bikeId: '25', // Specific ID
      date: new Date(),
      branch: 'Test Branch',
      brand: 'Bajaj',
      category: 'CT 100',
      model: 'CT 100 ES',
      color: 'Green',
      engineNo: 'SPECIFIC-ENG-001',
      chassisNumber: 'SPECIFIC-CHS-001'
    });
    
    const savedSpecificBike = await specificBike.save();
    console.log(`✅ Created bike with specific ID: ${savedSpecificBike.bikeId}`);
    
    // Now test auto-increment after this
    const allBikesAfterSpecific = await BikeInventory.find({}, 'bikeId');
    let maxBikeIdAfterSpecific = 0;
    
    allBikesAfterSpecific.forEach(bike => {
      if (bike.bikeId) {
        const bikeIdStr = bike.bikeId.toString();
        const numericPart = parseInt(bikeIdStr.match(/\d+/)?.[0] || '0');
        if (numericPart > maxBikeIdAfterSpecific) {
          maxBikeIdAfterSpecific = numericPart;
        }
      }
    });
    
    const nextIdAfterSpecific = maxBikeIdAfterSpecific + 1;
    
    console.log(`  - Highest Bike ID: ${maxBikeIdAfterSpecific}`);
    console.log(`  - Next Auto-Generated ID: ${nextIdAfterSpecific}`);
    
    savedBikes.push(savedSpecificBike);

    // Test 6: Test dropdown data endpoint
    console.log('\n🌐 TESTING DROPDOWN DATA ENDPOINT:');
    
    // Simulate the dropdown data logic
    const vehicles = await Vehicle.find();
    const allBikesForDropdown = await BikeInventory.find({}, 'bikeId');
    let maxBikeIdForDropdown = 0;
    
    allBikesForDropdown.forEach(bike => {
      if (bike.bikeId) {
        const bikeIdStr = bike.bikeId.toString();
        const numericPart = parseInt(bikeIdStr.match(/\d+/)?.[0] || '0');
        if (numericPart > maxBikeIdForDropdown) {
          maxBikeIdForDropdown = numericPart;
        }
      }
    });
    
    const nextBikeIdForDropdown = maxBikeIdForDropdown + 1;
    
    console.log(`  - Next Bike ID for dropdown: ${nextBikeIdForDropdown}`);

    // Test 7: Clean up
    console.log('\n🗑️ CLEANING UP:');
    for (const bike of savedBikes) {
      await BikeInventory.findByIdAndDelete(bike._id);
      console.log(`✅ Deleted: Bike ID ${bike.bikeId}`);
    }

    console.log('\n🎉 BIKE ID AUTO-INCREMENT TEST COMPLETED!');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the test
testBikeIdAutoIncrement(); 