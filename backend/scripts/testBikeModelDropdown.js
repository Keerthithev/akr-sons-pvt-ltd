const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Vehicle = require('../models/Vehicle.cjs');

dotenv.config({ path: './.env' });

async function testBikeModelDropdown() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('🔗 Connected to MongoDB');
    console.log('='.repeat(60));

    console.log('🧪 TESTING BIKE MODEL DROPDOWN');
    console.log('='.repeat(60));

    // Get all vehicles
    const vehicles = await Vehicle.find();
    console.log(`\n📊 FOUND ${vehicles.length} BIKE MODELS:`);
    
    vehicles.forEach(vehicle => {
      console.log(`  - ${vehicle.name} - LKR ${vehicle.price?.toLocaleString()}`);
    });

    // Test dropdown data structure
    const dropdownData = {
      vehicles: vehicles.map(v => ({
        name: v.name,
        category: v.category,
        price: v.price,
        colors: v.colors?.map(c => c.name) || []
      }))
    };

    console.log('\n✅ DROPDOWN OPTIONS:');
    dropdownData.vehicles.forEach(vehicle => {
      console.log(`  • ${vehicle.name} - LKR ${vehicle.price?.toLocaleString()}`);
    });

    // Test model selection
    console.log('\n🧪 TESTING MODEL SELECTION:');
    const testModel = vehicles[0];
    if (testModel) {
      console.log(`Selected model: ${testModel.name}`);
      console.log(`Price: LKR ${testModel.price?.toLocaleString()}`);
      console.log(`Auto-filled cost price: LKR ${Math.round(testModel.price * 0.8).toLocaleString()}`);
      console.log(`Available colors: ${testModel.colors?.map(c => c.name).join(', ')}`);
    }

    console.log('\n🎉 BIKE MODEL DROPDOWN TEST COMPLETED!');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the test
testBikeModelDropdown(); 