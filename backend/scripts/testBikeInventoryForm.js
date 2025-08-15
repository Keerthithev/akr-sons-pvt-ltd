const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Vehicle = require('../models/Vehicle.cjs');
const BikeInventory = require('../models/BikeInventory');

dotenv.config({ path: './.env' });

async function testBikeInventoryForm() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('🔗 Connected to MongoDB');
    console.log('='.repeat(60));

    console.log('🧪 TESTING BIKE INVENTORY FORM AUTO-FILL');
    console.log('='.repeat(60));

    // Get all vehicles for reference
    const vehicles = await Vehicle.find();
    console.log(`\n📊 FOUND ${vehicles.length} VEHICLES FOR DROPDOWN:`);
    
    vehicles.forEach(vehicle => {
      console.log(`  - ${vehicle.name} (${vehicle.category}) - LKR ${vehicle.price?.toLocaleString()}`);
    });

    // Test auto-fill logic for different models
    console.log('\n🧪 TESTING AUTO-FILL LOGIC:');
    console.log('-'.repeat(40));

    const testModels = ['CT 100 ES', 'Discover 125 DRL', 'Pulsar NS200'];
    
    testModels.forEach(modelName => {
      const vehicle = vehicles.find(v => v.name === modelName);
      if (vehicle) {
        const costPrice = Math.round(vehicle.price * 0.8);
        console.log(`\n📝 Model: ${vehicle.name}`);
        console.log(`  - Category: ${vehicle.category}`);
        console.log(`  - Brand: Bajaj (auto-filled)`);
        console.log(`  - Cost Price: LKR ${costPrice.toLocaleString()} (auto-calculated)`);
        console.log(`  - Selling Price: LKR ${vehicle.price?.toLocaleString()} (auto-filled)`);
        console.log(`  - Available Colors: ${vehicle.colors?.map(c => c.name).join(', ')}`);
      }
    });

    // Test form submission with auto-filled data
    console.log('\n📝 TESTING FORM SUBMISSION:');
    console.log('-'.repeat(30));

    const testFormData = {
      date: new Date(),
      bikeId: 'FORM-TEST-001',
      branch: 'Test Branch',
      brand: 'Bajaj', // Auto-filled
      category: 'CT 100', // Auto-filled
      model: 'CT 100 ES',
      color: 'Blue',
      engineNo: 'FORM-ENG-001',
      chassisNumber: 'FORM-CHS-001',
      stockQuantity: 1,
      unitCostPrice: 510360, // Auto-calculated
      sellingPrice: 637950 // Auto-filled
    };

    console.log('Form Data to Submit:');
    Object.entries(testFormData).forEach(([key, value]) => {
      if (key === 'date') {
        console.log(`  - ${key}: ${new Date(value).toLocaleDateString()}`);
      } else if (typeof value === 'number' && key.includes('Price')) {
        console.log(`  - ${key}: LKR ${value.toLocaleString()}`);
      } else {
        console.log(`  - ${key}: ${value}`);
      }
    });

    // Create test record
    const testBike = new BikeInventory(testFormData);
    const savedBike = await testBike.save();
    console.log(`\n✅ Test bike created: ${savedBike.model} (Category: ${savedBike.category})`);

    // Verify saved data
    console.log('\n📊 VERIFICATION:');
    const savedBikeCheck = await BikeInventory.findById(savedBike._id);
    console.log(`Model: ${savedBikeCheck.model}`);
    console.log(`Category: ${savedBikeCheck.category}`);
    console.log(`Brand: ${savedBikeCheck.brand}`);
    console.log(`Cost Price: LKR ${savedBikeCheck.unitCostPrice?.toLocaleString()}`);
    console.log(`Selling Price: LKR ${savedBikeCheck.sellingPrice?.toLocaleString()}`);

    // Clean up
    console.log('\n🗑️ CLEANING UP:');
    await BikeInventory.findByIdAndDelete(savedBike._id);
    console.log('✅ Test bike deleted');

    console.log('\n🎉 BIKE INVENTORY FORM TEST COMPLETED!');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the test
testBikeInventoryForm(); 