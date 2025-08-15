const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Vehicle = require('../models/Vehicle.cjs');
const BikeInventory = require('../models/BikeInventory');

dotenv.config({ path: './.env' });

async function updateVehicleStockFromInventory() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('🔗 Connected to MongoDB');
    console.log('='.repeat(60));

    console.log('📦 UPDATING VEHICLE STOCK FROM BIKE INVENTORY');
    console.log('='.repeat(60));

    // Get all vehicles
    const vehicles = await Vehicle.find();
    console.log(`\n📊 FOUND ${vehicles.length} VEHICLES:`);
    vehicles.forEach(vehicle => {
      console.log(`  - ${vehicle.name}: Current stock ${vehicle.stockQuantity}`);
    });

    // Get bike inventory counts by model
    const bikeInventory = await BikeInventory.find();
    const stockByModel = {};
    
    bikeInventory.forEach(bike => {
      if (!stockByModel[bike.model]) {
        stockByModel[bike.model] = 0;
      }
      stockByModel[bike.model]++;
    });

    console.log(`\n📊 BIKE INVENTORY COUNTS:`);
    Object.entries(stockByModel).forEach(([model, count]) => {
      console.log(`  - ${model}: ${count} bikes`);
    });

    // Update vehicle stock quantities
    console.log('\n🔄 UPDATING VEHICLE STOCK:');
    console.log('-'.repeat(30));

    let updatedCount = 0;
    for (const vehicle of vehicles) {
      const inventoryCount = stockByModel[vehicle.name] || 0;
      const oldStock = vehicle.stockQuantity;
      
      if (inventoryCount !== oldStock) {
        vehicle.stockQuantity = inventoryCount;
        vehicle.available = inventoryCount > 0;
        await vehicle.save();
        
        console.log(`✅ ${vehicle.name}: ${oldStock} → ${inventoryCount} units`);
        updatedCount++;
      } else {
        console.log(`⏭️ ${vehicle.name}: Already correct (${oldStock} units)`);
      }
    }

    console.log(`\n✅ Updated ${updatedCount} vehicles`);

    // Final verification
    console.log('\n📊 FINAL VEHICLE STOCK STATUS:');
    console.log('-'.repeat(35));

    const updatedVehicles = await Vehicle.find();
    updatedVehicles.forEach(vehicle => {
      console.log(`${vehicle.name}: ${vehicle.stockQuantity} units (${vehicle.available ? 'Available' : 'Not Available'})`);
    });

    // Show color-wise breakdown
    console.log('\n🎨 COLOR-WISE STOCK BREAKDOWN:');
    console.log('-'.repeat(35));

    const colorStock = {};
    bikeInventory.forEach(bike => {
      const key = `${bike.model} - ${bike.color}`;
      if (!colorStock[key]) {
        colorStock[key] = 0;
      }
      colorStock[key]++;
    });

    Object.entries(colorStock).forEach(([key, count]) => {
      console.log(`${key}: ${count} units`);
    });

    console.log('\n🎉 VEHICLE STOCK UPDATE COMPLETED!');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Update failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the update
updateVehicleStockFromInventory(); 