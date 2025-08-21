const mongoose = require('mongoose');
const BikeInventory = require('../models/BikeInventory');
require('dotenv').config();

async function fixBikeIds() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Get all bikes sorted by creation date
    const allBikes = await BikeInventory.find({}).sort({ createdAt: 1 });
    console.log(`Found ${allBikes.length} bikes to process`);

    let updatedCount = 0;
    let duplicateCount = 0;

    for (let i = 0; i < allBikes.length; i++) {
      const bike = allBikes[i];
      const expectedBikeId = (i + 1).toString();
      
      if (bike.bikeId !== expectedBikeId) {
        console.log(`Fixing Bike ID: ${bike.bikeId} → ${expectedBikeId}`);
        
        try {
          await BikeInventory.findByIdAndUpdate(bike._id, { bikeId: expectedBikeId });
          updatedCount++;
        } catch (error) {
          if (error.code === 11000) {
            console.log(`Duplicate Bike ID found: ${bike.bikeId}`);
            duplicateCount++;
          } else {
            console.error(`Error updating bike ${bike._id}:`, error.message);
          }
        }
      }
    }

    console.log('\n✅ Bike ID Fix Summary:');
    console.log(`- Total bikes processed: ${allBikes.length}`);
    console.log(`- Bikes updated: ${updatedCount}`);
    console.log(`- Duplicates found: ${duplicateCount}`);

    // Verify all bikes now have unique sequential IDs
    const finalBikes = await BikeInventory.find({}).sort({ bikeId: 1 });
    console.log('\n📋 Final Bike ID Sequence:');
    finalBikes.forEach((bike, index) => {
      console.log(`${index + 1}. Bike ID: ${bike.bikeId} - Model: ${bike.model}`);
    });

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  } catch (error) {
    console.error('Error fixing bike IDs:', error);
    process.exit(1);
  }
}

fixBikeIds(); 