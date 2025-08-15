const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Vehicle = require('../models/Vehicle.cjs');
const BikeInventory = require('../models/BikeInventory');

dotenv.config({ path: './.env' });

async function testBikeInventoryDateFilter() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('🔗 Connected to MongoDB');
    console.log('='.repeat(60));

    console.log('🧪 TESTING BIKE INVENTORY DATE FILTERING');
    console.log('='.repeat(60));

    // Test 1: Check current bike inventory dates
    console.log('\n📊 CURRENT BIKE INVENTORY DATES:');
    const currentBikes = await BikeInventory.find().sort({ date: -1 });
    currentBikes.forEach(bike => {
      console.log(`  - ${bike.model} (${bike.bikeId}): ${new Date(bike.date).toLocaleDateString()}`);
    });

    // Test 2: Test date filtering logic
    console.log('\n🧪 TESTING DATE FILTER LOGIC:');
    const now = new Date();
    
    // Today
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const todayBikes = await BikeInventory.find({
      date: { $gte: todayStart, $lt: todayEnd }
    });
    console.log(`Today (${todayStart.toLocaleDateString()}): ${todayBikes.length} bikes`);

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

    // This month
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const thisMonthBikes = await BikeInventory.find({
      date: { $gte: thisMonthStart, $lt: thisMonthEnd }
    });
    console.log(`This month (${thisMonthStart.toLocaleDateString()}): ${thisMonthBikes.length} bikes`);

    // Test 3: Create test bikes with different dates
    console.log('\n📝 CREATING TEST BIKES WITH DIFFERENT DATES:');
    
    const testBikes = [
      {
        date: new Date(), // Today
        bikeId: 'TEST-TODAY-001',
        branch: 'Test Branch',
        brand: 'Bajaj',
        category: 'CT 100',
        model: 'CT 100 ES',
        color: 'Blue',
        engineNo: 'TEST-TODAY-ENG-001',
        chassisNumber: 'TEST-TODAY-CHS-001'
      },
      {
        date: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        bikeId: 'TEST-3DAYS-001',
        branch: 'Test Branch',
        brand: 'Bajaj',
        category: 'CT 100',
        model: 'CT 100 ES',
        color: 'Red',
        engineNo: 'TEST-3DAYS-ENG-001',
        chassisNumber: 'TEST-3DAYS-CHS-001'
      },
      {
        date: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
        bikeId: 'TEST-15DAYS-001',
        branch: 'Test Branch',
        brand: 'Bajaj',
        category: 'Discover',
        model: 'Discover 125 DRL',
        color: 'Black',
        engineNo: 'TEST-15DAYS-ENG-001',
        chassisNumber: 'TEST-15DAYS-CHS-001'
      }
    ];

    const savedBikes = [];
    for (const bikeData of testBikes) {
      const bike = new BikeInventory(bikeData);
      const savedBike = await bike.save();
      savedBikes.push(savedBike);
      console.log(`✅ Created: ${savedBike.model} (${savedBike.bikeId}) - ${new Date(savedBike.date).toLocaleDateString()}`);
    }

    // Test 4: Verify date filtering with new bikes
    console.log('\n📊 VERIFYING DATE FILTERING WITH NEW BIKES:');
    
    const todayBikesNew = await BikeInventory.find({
      date: { $gte: todayStart, $lt: todayEnd }
    });
    console.log(`Today: ${todayBikesNew.length} bikes`);

    const last7DaysBikesNew = await BikeInventory.find({
      date: { $gte: last7DaysStart, $lt: last7DaysEnd }
    });
    console.log(`Last 7 days: ${last7DaysBikesNew.length} bikes`);

    const last30DaysBikesNew = await BikeInventory.find({
      date: { $gte: last30DaysStart, $lt: last30DaysEnd }
    });
    console.log(`Last 30 days: ${last30DaysBikesNew.length} bikes`);

    // Test 5: Clean up
    console.log('\n🗑️ CLEANING UP:');
    for (const bike of savedBikes) {
      await BikeInventory.findByIdAndDelete(bike._id);
      console.log(`✅ Deleted: ${bike.model} (${bike.bikeId})`);
    }

    console.log('\n🎉 BIKE INVENTORY DATE FILTER TEST COMPLETED!');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the test
testBikeInventoryDateFilter(); 