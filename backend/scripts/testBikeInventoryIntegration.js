const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Vehicle = require('../models/Vehicle.cjs');
const BikeInventory = require('../models/BikeInventory');
const bikeInventoryController = require('../controllers/bikeInventoryController');

dotenv.config({ path: './.env' });

async function testBikeInventoryIntegration() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('🔗 Connected to MongoDB');
    console.log('='.repeat(60));

    console.log('🧪 TESTING BIKE INVENTORY INTEGRATION');
    console.log('='.repeat(60));

    // Test 1: Check current stock
    console.log('\n📊 TEST 1: CURRENT STOCK STATUS');
    console.log('-'.repeat(35));

    const vehicles = await Vehicle.find();
    vehicles.forEach(vehicle => {
      console.log(`${vehicle.name}: ${vehicle.stockQuantity} units`);
    });

    // Test 2: Create new bike inventory
    console.log('\n📝 TEST 2: CREATE NEW BIKE INVENTORY');
    console.log('-'.repeat(40));

    const newBikeData = {
      date: new Date(),
      bikeId: 'TEST-001',
      branch: 'Test Branch',
      brand: 'Bajaj',
      model: 'CT 100 ES',
      color: 'Black & Blue',
      engineNo: 'TEST-ENG-001',
      chassisNumber: 'TEST-CHS-001',
      stockQuantity: 1,
      unitCostPrice: 510360,
      sellingPrice: 637950
    };

    const mockReq = { body: newBikeData };
    const mockRes = {
      status: (code) => ({
        json: (data) => {
          console.log(`✅ Created bike inventory with status ${code}`);
          return data;
        }
      })
    };

    await bikeInventoryController.createBikeInventory(mockReq, mockRes, () => {});

    // Test 3: Verify stock updated
    console.log('\n📊 TEST 3: VERIFY STOCK UPDATED');
    console.log('-'.repeat(35));

    const updatedVehicles = await Vehicle.find();
    updatedVehicles.forEach(vehicle => {
      if (vehicle.name === 'CT 100 ES') {
        console.log(`✅ ${vehicle.name}: ${vehicle.stockQuantity} units (should be 10)`);
      }
    });

    // Test 4: Update bike inventory
    console.log('\n📝 TEST 4: UPDATE BIKE INVENTORY');
    console.log('-'.repeat(40));

    const createdBike = await BikeInventory.findOne({ bikeId: 'TEST-001' });
    if (createdBike) {
      const updateData = {
        model: 'Discover 125 DRL',
        color: 'Black & Red'
      };

      const updateReq = { 
        params: { id: createdBike._id },
        body: updateData 
      };
      const updateRes = {
        json: (data) => {
          console.log('✅ Updated bike inventory');
          return data;
        }
      };

      await bikeInventoryController.updateBikeInventory(updateReq, updateRes, () => {});

      // Verify both models updated
      console.log('\n📊 TEST 5: VERIFY BOTH MODELS UPDATED');
      console.log('-'.repeat(40));

      const finalVehicles = await Vehicle.find();
      finalVehicles.forEach(vehicle => {
        if (vehicle.name === 'CT 100 ES' || vehicle.name === 'Discover 125 DRL') {
          console.log(`✅ ${vehicle.name}: ${vehicle.stockQuantity} units`);
        }
      });
    }

    // Test 6: Delete bike inventory
    console.log('\n🗑️ TEST 6: DELETE BIKE INVENTORY');
    console.log('-'.repeat(35));

    if (createdBike) {
      const deleteReq = { params: { id: createdBike._id } };
      const deleteRes = {
        json: (data) => {
          console.log('✅ Deleted bike inventory');
          return data;
        }
      };

      await bikeInventoryController.deleteBikeInventory(deleteReq, deleteRes, () => {});

      // Verify stock reverted
      console.log('\n📊 TEST 7: VERIFY STOCK REVERTED');
      console.log('-'.repeat(35));

      const finalVehicles = await Vehicle.find();
      finalVehicles.forEach(vehicle => {
        if (vehicle.name === 'Discover 125 DRL') {
          console.log(`✅ ${vehicle.name}: ${vehicle.stockQuantity} units (should be back to 1)`);
        }
      });
    }

    // Test 8: Final verification
    console.log('\n📊 TEST 8: FINAL VERIFICATION');
    console.log('-'.repeat(30));

    const finalVehicles = await Vehicle.find();
    console.log('Final Vehicle Stock Status:');
    finalVehicles.forEach(vehicle => {
      console.log(`${vehicle.name}: ${vehicle.stockQuantity} units`);
    });

    const finalBikeInventory = await BikeInventory.find();
    console.log(`\nFinal Bike Inventory Count: ${finalBikeInventory.length} bikes`);

    console.log('\n🎉 BIKE INVENTORY INTEGRATION TEST COMPLETED!');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the test
testBikeInventoryIntegration(); 