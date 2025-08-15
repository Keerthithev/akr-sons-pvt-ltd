const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Vehicle = require('../models/Vehicle.cjs');
const Company = require('../models/Company.cjs');

// Load environment variables
dotenv.config({ path: './.env' });

const seedVehiclesWithStock = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Get the company
    const company = await Company.findOne({ name: 'AKR & SONS (PVT) LTD' });
    if (!company) {
      console.log('Company not found, creating...');
      const newCompany = new Company({
        name: 'AKR & SONS (PVT) LTD',
        description: 'Leading vehicle dealership',
        logo: '',
        website: '',
        phone: '',
        email: '',
        address: ''
      });
      await newCompany.save();
      console.log('Company created');
    }

    // Sample vehicles with stock quantities
    const vehiclesData = [
      {
        vehicleType: 'Motorcycle',
        name: 'Honda CG 125',
        category: 'Commuter',
        price: 275000,
        description: 'Reliable commuter motorcycle with excellent fuel efficiency',
        stockQuantity: 15,
        available: true,
        company: company._id,
        features: ['Fuel Efficient', 'Low Maintenance', 'Reliable Engine'],
        specs: {
          'Engine': '125cc',
          'Mileage': '60 km/l',
          'Power': '8.5 HP'
        },
        colors: [
          {
            name: 'Red',
            hex: '#FF0000',
            images: ['https://example.com/honda-cg125-red.jpg']
          }
        ],
        rating: 4.5
      },
      {
        vehicleType: 'Motorcycle',
        name: 'Yamaha YBR 125',
        category: 'Commuter',
        price: 250000,
        description: 'Stylish and efficient commuter bike',
        stockQuantity: 8,
        available: true,
        company: company._id,
        features: ['Stylish Design', 'Good Performance', 'Comfortable Ride'],
        specs: {
          'Engine': '125cc',
          'Mileage': '55 km/l',
          'Power': '8.2 HP'
        },
        colors: [
          {
            name: 'Blue',
            hex: '#0000FF',
            images: ['https://example.com/yamaha-ybr125-blue.jpg']
          }
        ],
        rating: 4.3
      },
      {
        vehicleType: 'Motorcycle',
        name: 'Suzuki GD 110',
        category: 'Commuter',
        price: 180000,
        description: 'Economical and practical motorcycle',
        stockQuantity: 0,
        available: true,
        company: company._id,
        features: ['Economical', 'Easy to Ride', 'Low Cost'],
        specs: {
          'Engine': '110cc',
          'Mileage': '70 km/l',
          'Power': '7.5 HP'
        },
        colors: [
          {
            name: 'Black',
            hex: '#000000',
            images: ['https://example.com/suzuki-gd110-black.jpg']
          }
        ],
        rating: 4.0
      },
      {
        vehicleType: 'Motorcycle',
        name: 'Yamaha R15 V4',
        category: 'Sports',
        price: 850000,
        description: 'High-performance sports motorcycle',
        stockQuantity: 3,
        available: true,
        company: company._id,
        features: ['High Performance', 'Sporty Design', 'Advanced Technology'],
        specs: {
          'Engine': '155cc',
          'Mileage': '45 km/l',
          'Power': '18.4 HP'
        },
        colors: [
          {
            name: 'Racing Blue',
            hex: '#0066CC',
            images: ['https://example.com/yamaha-r15-blue.jpg']
          }
        ],
        rating: 4.8
      }
    ];

    // Clear existing vehicles
    await Vehicle.deleteMany({});
    console.log('Cleared existing vehicles');

    // Insert new vehicles
    const result = await Vehicle.insertMany(vehiclesData);
    console.log(`Successfully seeded ${result.length} vehicles with stock quantities`);

    // Log stock summary
    const totalStock = result.reduce((sum, vehicle) => sum + (vehicle.stockQuantity || 0), 0);
    console.log(`Total stock across all vehicles: ${totalStock}`);
    
    result.forEach(vehicle => {
      console.log(`${vehicle.name}: ${vehicle.stockQuantity || 0} units`);
    });

    console.log('Vehicle seeding completed successfully');
  } catch (error) {
    console.error('Error seeding vehicles:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

seedVehiclesWithStock(); 