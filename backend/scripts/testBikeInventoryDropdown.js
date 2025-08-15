const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Vehicle = require('../models/Vehicle.cjs');
const BikeInventory = require('../models/BikeInventory');

dotenv.config({ path: './.env' });

async function testBikeInventoryDropdown() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('🔗 Connected to MongoDB');
    console.log('='.repeat(60));

    console.log('🧪 TESTING BIKE INVENTORY DROPDOWN DATA');
    console.log('='.repeat(60));

    // Get all vehicles
    const vehicles = await Vehicle.find();
    console.log(`\n📊 FOUND ${vehicles.length} VEHICLES:`);
    vehicles.forEach(vehicle => {
      console.log(`  - ${vehicle.name} (${vehicle.category})`);
    });

    // Get unique categories
    const categories = [...new Set(vehicles.map(v => v.category))];
    console.log(`\n📋 UNIQUE CATEGORIES: ${categories.join(', ')}`);

    // Get vehicles grouped by category
    const vehiclesByCategory = {};
    categories.forEach(category => {
      vehiclesByCategory[category] = vehicles.filter(v => v.category === category);
    });

    console.log('\n📊 VEHICLES BY CATEGORY:');
    Object.entries(vehiclesByCategory).forEach(([category, categoryVehicles]) => {
      console.log(`\n${category}:`);
      categoryVehicles.forEach(vehicle => {
        console.log(`  - ${vehicle.name}: LKR ${vehicle.price?.toLocaleString()}`);
      });
    });

    // Get all available colors
    const allColors = [...new Set(vehicles.flatMap(v => v.colors?.map(c => c.name) || []))];
    console.log(`\n🎨 ALL AVAILABLE COLORS: ${allColors.join(', ')}`);

    // Test the dropdown data structure
    const dropdownData = {
      categories,
      vehiclesByCategory,
      allColors,
      vehicles: vehicles.map(v => ({
        name: v.name,
        category: v.category,
        price: v.price,
        colors: v.colors?.map(c => c.name) || []
      }))
    };

    console.log('\n✅ DROPDOWN DATA STRUCTURE:');
    console.log(`- Categories: ${dropdownData.categories.length}`);
    console.log(`- Vehicles: ${dropdownData.vehicles.length}`);
    console.log(`- Colors: ${dropdownData.allColors.length}`);

    // Test category selection
    console.log('\n🧪 TESTING CATEGORY SELECTION:');
    const testCategory = categories[0];
    console.log(`Selected category: ${testCategory}`);
    console.log(`Available models: ${vehiclesByCategory[testCategory]?.map(v => v.name).join(', ')}`);

    // Test model selection
    if (vehiclesByCategory[testCategory]?.length > 0) {
      const testModel = vehiclesByCategory[testCategory][0];
      console.log(`\nSelected model: ${testModel.name}`);
      console.log(`Price: LKR ${testModel.price?.toLocaleString()}`);
      console.log(`Colors: ${testModel.colors?.map(c => c.name).join(', ')}`);
      console.log(`Auto-filled cost price: LKR ${Math.round(testModel.price * 0.8).toLocaleString()}`);
    }

    console.log('\n🎉 DROPDOWN DATA TEST COMPLETED!');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the test
testBikeInventoryDropdown(); 