const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Vehicle = require('../models/Vehicle.cjs');
const BikeInventory = require('../models/BikeInventory');

dotenv.config({ path: './.env' });

async function testSimplifiedBikeInventory() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('🔗 Connected to MongoDB');
    console.log('='.repeat(60));

    console.log('🧪 TESTING SIMPLIFIED BIKE INVENTORY');
    console.log('='.repeat(60));

    // Test 1: Check current bike inventory
    console.log('\n📊 CURRENT BIKE INVENTORY:');
    const currentBikes = await BikeInventory.find();
    currentBikes.forEach(bike => {
      console.log(`  - ${bike.model} (${bike.category}) - ${bike.bikeId}`);
    });

    // Test 2: Create a test bike with simplified data
    console.log('\n📝 CREATING TEST BIKE WITH SIMPLIFIED DATA:');
    const testBikeData = {
      date: new Date(),
      bikeId: 'SIMPLIFIED-001',
      branch: 'Test Branch',
      brand: 'Bajaj',
      category: 'CT 100',
      model: 'CT 100 ES',
      color: 'Blue',
      engineNo: 'SIMPLIFIED-ENG-001',
      chassisNumber: 'SIMPLIFIED-CHS-001'
    };

    console.log('Required Fields Only:');
    Object.entries(testBikeData).forEach(([key, value]) => {
      if (key === 'date') {
        console.log(`  - ${key}: ${new Date(value).toLocaleDateString()}`);
      } else {
        console.log(`  - ${key}: ${value}`);
      }
    });

    const testBike = new BikeInventory(testBikeData);
    const savedBike = await testBike.save();
    console.log(`\n✅ Test bike created: ${savedBike.model} (${savedBike.category})`);

    // Test 3: Verify the saved data
    console.log('\n📊 VERIFICATION:');
    const savedBikeCheck = await BikeInventory.findById(savedBike._id);
    console.log(`Date: ${new Date(savedBikeCheck.date).toLocaleDateString()}`);
    console.log(`Bike ID: ${savedBikeCheck.bikeId}`);
    console.log(`Branch: ${savedBikeCheck.branch}`);
    console.log(`Category: ${savedBikeCheck.category}`);
    console.log(`Model: ${savedBikeCheck.model}`);
    console.log(`Color: ${savedBikeCheck.color}`);
    console.log(`Engine No: ${savedBikeCheck.engineNo}`);
    console.log(`Chassis Number: ${savedBikeCheck.chassisNumber}`);

    // Test 4: Check table columns
    console.log('\n📋 TABLE COLUMNS:');
    const tableColumns = [
      'Date',
      'Bike ID', 
      'Branch',
      'Category',
      'Model',
      'Color',
      'Engine No',
      'Chassis Number',
      'Actions'
    ];
    tableColumns.forEach((column, index) => {
      console.log(`  ${index + 1}. ${column}`);
    });

    // Test 5: Check form fields
    console.log('\n📝 FORM FIELDS:');
    const formFields = [
      'Date',
      'Bike ID',
      'Branch', 
      'Bike Model (dropdown)',
      'Category (auto-filled)',
      'Color (dropdown)',
      'Engine No',
      'Chassis Number'
    ];
    formFields.forEach((field, index) => {
      console.log(`  ${index + 1}. ${field}`);
    });

    // Test 6: Clean up
    console.log('\n🗑️ CLEANING UP:');
    await BikeInventory.findByIdAndDelete(savedBike._id);
    console.log('✅ Test bike deleted');

    console.log('\n🎉 SIMPLIFIED BIKE INVENTORY TEST COMPLETED!');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the test
testSimplifiedBikeInventory(); 