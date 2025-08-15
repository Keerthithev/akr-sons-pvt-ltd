const mongoose = require('mongoose');
const BikeInventory = require('../models/BikeInventory');
require('dotenv').config({ path: './.env' });

const bikeInventoryData = [
  {
    date: new Date('2025-01-06'),
    bikeId: '1',
    branch: 'Murunkan',
    brand: 'Bajaj',
    model: 'CT-100',
    color: 'Black & Blue',
    dateOfPurchase: new Date('2025-01-06'),
    engineNo: 'PF×WRE30109',
    chassisNumber: 'MD2B37A×0RWE63011'
  },
  {
    date: new Date('2025-01-06'),
    bikeId: '2',
    branch: 'Murunkan',
    brand: 'Bajaj',
    model: 'CT-100',
    color: 'Black & Blue',
    dateOfPurchase: new Date('2025-01-06'),
    engineNo: 'PF×WRE38581',
    chassisNumber: 'MD2B37A×7RWE65662'
  },
  {
    date: new Date('2025-01-09'),
    bikeId: '3',
    branch: 'Murunkan',
    brand: 'Bajaj',
    model: 'CT-100',
    color: 'Black & Blue',
    dateOfPurchase: new Date('2025-01-09'),
    engineNo: 'PF×WRE19709',
    chassisNumber: 'MD2B37A×9RWE79937'
  },
  {
    date: new Date('2025-01-09'),
    bikeId: '4',
    branch: 'Mallavi',
    brand: 'Bajaj',
    model: 'CT-100',
    color: 'Black & Blue',
    dateOfPurchase: new Date('2025-01-09'),
    engineNo: 'PF×WRE29629',
    chassisNumber: 'MD2B37A×5RWE63084'
  },
  {
    date: new Date('2025-01-10'),
    bikeId: '5',
    branch: 'Murunkan',
    brand: 'Bajaj',
    model: 'Discovary-125',
    color: 'Black & Blue',
    dateOfPurchase: new Date('2025-01-10'),
    engineNo: 'JZ×WRG88338',
    chassisNumber: 'MD2B44B××RWG00580'
  },
  {
    date: new Date('2025-01-11'),
    bikeId: '6',
    branch: 'Murunkan',
    brand: 'Bajaj',
    model: 'CT-100',
    color: 'Black & Blue',
    dateOfPurchase: new Date('2025-01-11'),
    engineNo: 'PF×WRF51835',
    chassisNumber: 'MD2B37A×8RWF72509'
  },
  {
    date: new Date('2025-01-13'),
    bikeId: '7',
    branch: 'Mulankavil',
    brand: 'Bajaj',
    model: 'CT-100',
    color: 'Black & Blue',
    dateOfPurchase: new Date('2025-01-13'),
    engineNo: 'PF×WRF16662',
    chassisNumber: 'MD2B37A×1RWF79043'
  },
  {
    date: new Date('2025-01-18'),
    bikeId: '8',
    branch: 'Murunkan',
    brand: 'Bajaj',
    model: 'CT-100',
    color: 'Black & Red',
    dateOfPurchase: new Date('2025-01-18'),
    engineNo: 'PF×WRE20087',
    chassisNumber: 'MD2B37A×5RWE67622'
  },
  {
    date: new Date('2025-01-25'),
    bikeId: '9',
    branch: 'Mulankavil',
    brand: 'Bajaj',
    model: 'CT-100',
    color: 'Black & Red',
    dateOfPurchase: new Date('2025-01-25'),
    engineNo: 'PF×WRE20069',
    chassisNumber: 'MD2B37A×9RWE67557'
  },
  {
    date: new Date('2025-01-31'),
    bikeId: '10',
    branch: 'Murunkan',
    brand: 'Bajaj',
    model: 'CT-100',
    color: 'Black & Blue',
    dateOfPurchase: new Date('2025-01-31'),
    engineNo: 'PF×WRF19293',
    chassisNumber: 'MD2B37A×9RWF79890'
  }
];

async function seedBikeInventory() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Check if data already exists
    const existingCount = await BikeInventory.countDocuments();
    if (existingCount > 0) {
      console.log(`Bike inventory already has ${existingCount} records. Skipping seed.`);
      process.exit(0);
    }

    // Insert bike inventory data
    const result = await BikeInventory.insertMany(bikeInventoryData);
    console.log(`✅ Successfully seeded ${result.length} bike inventory records`);

    // Get statistics
    const stats = await BikeInventory.aggregate([
      {
        $group: {
          _id: null,
          totalBikes: { $sum: 1 },
          totalStockQuantity: { $sum: '$stockQuantity' },
          totalCostValue: { $sum: { $multiply: ['$unitCostPrice', '$stockQuantity'] } },
          totalSellingValue: { $sum: { $multiply: ['$sellingPrice', '$stockQuantity'] } }
        }
      }
    ]);

    const resultStats = stats[0] || { totalBikes: 0, totalStockQuantity: 0, totalCostValue: 0, totalSellingValue: 0 };

    console.log('\n=== BIKE INVENTORY SUMMARY ===');
    console.log(`Total Bikes: ${resultStats.totalBikes}`);
    console.log(`Total Stock Quantity: ${resultStats.totalStockQuantity}`);
    console.log(`Total Cost Value: LKR ${resultStats.totalCostValue.toLocaleString()}`);
    console.log(`Total Selling Value: LKR ${resultStats.totalSellingValue.toLocaleString()}`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding bike inventory:', error);
    process.exit(1);
  }
}

seedBikeInventory(); 