const mongoose = require('mongoose');
require('dotenv').config();
const BikeInventory = require('../models/BikeInventory');
const Vehicle = require('../models/Vehicle.cjs');

async function checkStockBreakdown() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/akr-sons', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Get all bikes with different statuses
    const allBikes = await BikeInventory.find({});
    const availableBikes = await BikeInventory.find({ status: 'in' });
    const soldBikes = await BikeInventory.find({ status: 'out' });

    console.log(`\n📊 COMPLETE STOCK BREAKDOWN:`);
    console.log(`============================`);
    console.log(`Total Bikes in Database: ${allBikes.length}`);
    console.log(`Available Bikes (status: 'in'): ${availableBikes.length}`);
    console.log(`Sold/Allocated Bikes (status: 'out'): ${soldBikes.length}`);

    // Group by model and status
    const stockByModel = {};
    
    allBikes.forEach(bike => {
      if (!stockByModel[bike.model]) {
        stockByModel[bike.model] = {
          model: bike.model,
          available: 0,
          sold: 0,
          total: 0,
          colors: {}
        };
      }
      
      stockByModel[bike.model].total++;
      
      if (bike.status === 'in') {
        stockByModel[bike.model].available++;
      } else if (bike.status === 'out') {
        stockByModel[bike.model].sold++;
      }
      
      // Track colors
      if (!stockByModel[bike.model].colors[bike.color]) {
        stockByModel[bike.model].colors[bike.color] = { available: 0, sold: 0 };
      }
      
      if (bike.status === 'in') {
        stockByModel[bike.model].colors[bike.color].available++;
      } else if (bike.status === 'out') {
        stockByModel[bike.model].colors[bike.color].sold++;
      }
    });

    console.log(`\n🔍 DETAILED BREAKDOWN BY MODEL:`);
    console.log(`===============================`);
    
    Object.values(stockByModel).forEach(model => {
      console.log(`\n📋 ${model.model}:`);
      console.log(`   Total: ${model.total} | Available: ${model.available} | Sold: ${model.sold}`);
      
      Object.entries(model.colors).forEach(([color, counts]) => {
        console.log(`   └─ ${color}: Available ${counts.available} | Sold ${counts.sold}`);
      });
    });

    // Show what the dashboard currently displays
    console.log(`\n🎯 DASHBOARD DISPLAY:`);
    console.log(`=====================`);
    console.log(`"Available Stock by Model & Color" shows: ${availableBikes.length} bikes`);
    console.log(`This is correct - it shows only available stock for sale.`);

    // Suggest improvements
    console.log(`\n💡 SUGGESTED IMPROVEMENTS:`);
    console.log(`========================`);
    console.log(`1. Add a summary card showing:`);
    console.log(`   - Total Stock: ${allBikes.length}`);
    console.log(`   - Available Stock: ${availableBikes.length}`);
    console.log(`   - Sold Stock: ${soldBikes.length}`);
    console.log(`2. Add a toggle to show "All Stock" vs "Available Stock Only"`);
    console.log(`3. Add color-coded indicators for stock levels`);

  } catch (error) {
    console.error('Error during analysis:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

checkStockBreakdown(); 