const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Vehicle = require('../models/Vehicle.cjs');
const BikeInventory = require('../models/BikeInventory');

dotenv.config({ path: './.env' });

async function fixBikeInventoryCategories() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('🔗 Connected to MongoDB');
    console.log('='.repeat(60));

    console.log('🔧 FIXING BIKE INVENTORY CATEGORIES');
    console.log('='.repeat(60));

    // Get all vehicles for reference
    const vehicles = await Vehicle.find();
    const vehicleMap = {};
    vehicles.forEach(vehicle => {
      vehicleMap[vehicle.name] = vehicle;
    });

    console.log('\n📊 VEHICLE REFERENCE DATA:');
    vehicles.forEach(vehicle => {
      console.log(`${vehicle.name}: ${vehicle.category}`);
    });

    // Get all bike inventory records
    const bikeInventory = await BikeInventory.find();
    console.log(`\n📊 FOUND ${bikeInventory.length} BIKE INVENTORY RECORDS:`);

    let updatedCount = 0;
    for (const bike of bikeInventory) {
      const vehicle = vehicleMap[bike.model];
      if (vehicle && (!bike.category || bike.category === '')) {
        bike.category = vehicle.category;
        await bike.save();
        console.log(`✅ Updated ${bike.model}: Category = ${vehicle.category}`);
        updatedCount++;
      } else if (vehicle && bike.category !== vehicle.category) {
        bike.category = vehicle.category;
        await bike.save();
        console.log(`✅ Updated ${bike.model}: Category = ${vehicle.category} (was ${bike.category})`);
        updatedCount++;
      } else if (!vehicle) {
        console.log(`⚠️ No vehicle found for model: ${bike.model}`);
      } else {
        console.log(`⏭️ ${bike.model}: Already correct (${bike.category})`);
      }
    }

    console.log(`\n✅ Updated ${updatedCount} bike inventory records`);

    // Verify the fixes
    console.log('\n📊 VERIFICATION - UPDATED BIKE INVENTORY:');
    console.log('-'.repeat(50));

    const updatedBikeInventory = await BikeInventory.find().sort({ date: -1 });
    updatedBikeInventory.forEach(bike => {
      console.log(`Bike ID: ${bike.bikeId}`);
      console.log(`  - Model: ${bike.model}`);
      console.log(`  - Category: ${bike.category || 'Missing'}`);
      console.log(`  - Color: ${bike.color}`);
      console.log('');
    });

    console.log('🎉 BIKE INVENTORY CATEGORIES FIXED!');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Fix failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the fix
fixBikeInventoryCategories(); 