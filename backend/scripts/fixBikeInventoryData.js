const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Vehicle = require('../models/Vehicle.cjs');
const BikeInventory = require('../models/BikeInventory');

dotenv.config({ path: './.env' });

async function fixBikeInventoryData() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('🔗 Connected to MongoDB');
    console.log('='.repeat(60));

    console.log('🔧 FIXING BIKE INVENTORY DATA');
    console.log('='.repeat(60));

    // Get all vehicles for reference
    const vehicles = await Vehicle.find();
    const vehicleMap = {};
    vehicles.forEach(vehicle => {
      vehicleMap[vehicle.name] = vehicle;
    });

    console.log('\n📊 VEHICLE REFERENCE DATA:');
    vehicles.forEach(vehicle => {
      console.log(`${vehicle.name}: LKR ${vehicle.price?.toLocaleString()}`);
    });

    // Fix model names and add prices
    console.log('\n🔧 FIXING MODEL NAMES AND PRICES:');
    console.log('-'.repeat(40));

    const bikeInventory = await BikeInventory.find();
    let updatedCount = 0;

    for (const bike of bikeInventory) {
      let updates = {};
      let modelChanged = false;

      // Fix model names
      if (bike.model === 'CT-100') {
        updates.model = 'CT 100 ES';
        modelChanged = true;
        console.log(`✅ Fixed model: CT-100 → CT 100 ES (Bike ID: ${bike.bikeId})`);
      } else if (bike.model === 'Discovary-125') {
        updates.model = 'Discover 125 DRL';
        modelChanged = true;
        console.log(`✅ Fixed model: Discovary-125 → Discover 125 DRL (Bike ID: ${bike.bikeId})`);
      }

      // Add prices based on the corrected model
      const correctedModel = updates.model || bike.model;
      const vehicle = vehicleMap[correctedModel];
      
      if (vehicle && (bike.unitCostPrice === 0 || bike.sellingPrice === 0)) {
        // Set cost price as 80% of selling price (typical markup)
        const costPrice = Math.round(vehicle.price * 0.8);
        updates.unitCostPrice = costPrice;
        updates.sellingPrice = vehicle.price;
        
        console.log(`✅ Added prices for ${correctedModel}: Cost LKR ${costPrice.toLocaleString()}, Selling LKR ${vehicle.price.toLocaleString()} (Bike ID: ${bike.bikeId})`);
      }

      if (Object.keys(updates).length > 0) {
        await BikeInventory.findByIdAndUpdate(bike._id, updates);
        updatedCount++;
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
      console.log(`  - Color: ${bike.color}`);
      console.log(`  - Cost Price: LKR ${bike.unitCostPrice?.toLocaleString() || '0'}`);
      console.log(`  - Selling Price: LKR ${bike.sellingPrice?.toLocaleString() || '0'}`);
      console.log('');
    });

    console.log('🎉 BIKE INVENTORY DATA FIXED!');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Fix failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the fix
fixBikeInventoryData(); 