const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Vehicle = require('../models/Vehicle.cjs');
const BikeInventory = require('../models/BikeInventory');

dotenv.config({ path: './.env' });

async function checkVehicleBikeInventoryMismatch() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('🔗 Connected to MongoDB');
    console.log('='.repeat(60));

    console.log('🔍 CHECKING VEHICLE vs BIKE INVENTORY MISMATCHES');
    console.log('='.repeat(60));

    // Get all vehicles
    const vehicles = await Vehicle.find();
    console.log(`\n📊 VEHICLE TAB DATA (${vehicles.length} vehicles):`);
    console.log('-'.repeat(50));

    vehicles.forEach(vehicle => {
      console.log(`Vehicle: ${vehicle.name}`);
      console.log(`  - Category: ${vehicle.category}`);
      console.log(`  - Price: LKR ${vehicle.price?.toLocaleString()}`);
      console.log(`  - Stock: ${vehicle.stockQuantity}`);
      console.log(`  - Colors: ${vehicle.colors?.map(c => c.name).join(', ') || 'None'}`);
      console.log(`  - Available: ${vehicle.available}`);
      console.log('');
    });

    // Get all bike inventory
    const bikeInventory = await BikeInventory.find().sort({ date: -1 });
    console.log(`\n📊 BIKE INVENTORY DATA (${bikeInventory.length} records):`);
    console.log('-'.repeat(50));

    bikeInventory.forEach(bike => {
      console.log(`Bike ID: ${bike.bikeId}`);
      console.log(`  - Date: ${bike.date.toLocaleDateString()}`);
      console.log(`  - Branch: ${bike.branch}`);
      console.log(`  - Brand: ${bike.brand}`);
      console.log(`  - Model: ${bike.model}`);
      console.log(`  - Color: ${bike.color}`);
      console.log(`  - Engine No: ${bike.engineNo}`);
      console.log(`  - Chassis: ${bike.chassisNumber}`);
      console.log(`  - Stock Qty: ${bike.stockQuantity}`);
      console.log(`  - Cost Price: LKR ${bike.unitCostPrice?.toLocaleString() || '0'}`);
      console.log(`  - Selling Price: LKR ${bike.sellingPrice?.toLocaleString() || '0'}`);
      console.log('');
    });

    // Check for model name mismatches
    console.log('\n⚠️ MODEL NAME MISMATCHES:');
    console.log('-'.repeat(30));

    const vehicleModels = vehicles.map(v => v.name);
    const bikeModels = [...new Set(bikeInventory.map(b => b.model))];

    console.log('Vehicle Tab Models:');
    vehicleModels.forEach(model => console.log(`  - ${model}`));

    console.log('\nBike Inventory Models:');
    bikeModels.forEach(model => console.log(`  - ${model}`));

    // Find mismatches
    const mismatches = bikeModels.filter(bikeModel => 
      !vehicleModels.some(vehicleModel => 
        vehicleModel.toLowerCase().includes(bikeModel.toLowerCase()) ||
        bikeModel.toLowerCase().includes(vehicleModel.toLowerCase())
      )
    );

    if (mismatches.length > 0) {
      console.log('\n❌ MISMATCHED MODELS (need to be fixed):');
      mismatches.forEach(model => console.log(`  - ${model}`));
    } else {
      console.log('\n✅ All models match!');
    }

    // Check color mismatches
    console.log('\n🎨 COLOR MISMATCHES:');
    console.log('-'.repeat(25));

    const vehicleColors = [...new Set(vehicles.flatMap(v => v.colors?.map(c => c.name) || []))];
    const bikeColors = [...new Set(bikeInventory.map(b => b.color))];

    console.log('Vehicle Tab Colors:');
    vehicleColors.forEach(color => console.log(`  - ${color}`));

    console.log('\nBike Inventory Colors:');
    bikeColors.forEach(color => console.log(`  - ${color}`));

    // Find color mismatches
    const colorMismatches = bikeColors.filter(bikeColor => 
      !vehicleColors.some(vehicleColor => 
        vehicleColor.toLowerCase().includes(bikeColor.toLowerCase()) ||
        bikeColor.toLowerCase().includes(vehicleColor.toLowerCase())
      )
    );

    if (colorMismatches.length > 0) {
      console.log('\n❌ MISMATCHED COLORS (need to be fixed):');
      colorMismatches.forEach(color => console.log(`  - ${color}`));
    } else {
      console.log('\n✅ All colors match!');
    }

    // Check stock quantity issues
    console.log('\n📦 STOCK QUANTITY ANALYSIS:');
    console.log('-'.repeat(30));

    const bikesWithZeroPrice = bikeInventory.filter(b => b.unitCostPrice === 0 || b.sellingPrice === 0);
    console.log(`Bikes with zero prices: ${bikesWithZeroPrice.length}`);

    const bikesWithZeroStock = bikeInventory.filter(b => b.stockQuantity === 0);
    console.log(`Bikes with zero stock: ${bikesWithZeroStock.length}`);

    // Calculate total stock by model
    console.log('\n📊 STOCK BY MODEL:');
    console.log('-'.repeat(20));

    const stockByModel = {};
    bikeInventory.forEach(bike => {
      if (!stockByModel[bike.model]) {
        stockByModel[bike.model] = 0;
      }
      stockByModel[bike.model] += bike.stockQuantity;
    });

    Object.entries(stockByModel).forEach(([model, stock]) => {
      console.log(`${model}: ${stock} units`);
    });

    console.log('\n🎉 ANALYSIS COMPLETED!');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Analysis failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the analysis
checkVehicleBikeInventoryMismatch(); 