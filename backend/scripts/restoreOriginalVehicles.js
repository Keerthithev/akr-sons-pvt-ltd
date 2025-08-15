const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Vehicle = require('../models/Vehicle.cjs');
const Company = require('../models/Company.cjs');

// Load environment variables
dotenv.config({ path: './.env' });

const restoreOriginalVehicles = async () => {
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

    // Original vehicles data based on the image files found
    const originalVehiclesData = [
      {
        vehicleType: 'Motorcycle',
        name: 'Honda CD 70',
        category: 'Commuter',
        price: 180000,
        description: 'Reliable and economical commuter motorcycle with excellent fuel efficiency',
        stockQuantity: 12,
        available: true,
        company: company._id,
        features: ['Fuel Efficient', 'Low Maintenance', 'Reliable Engine', 'Easy to Ride'],
        specs: {
          'Engine': '70cc',
          'Mileage': '65 km/l',
          'Power': '5.5 HP',
          'Transmission': '4-Speed Manual'
        },
        colors: [
          {
            name: 'Red',
            hex: '#FF0000',
            images: ['/images/bikes/Honda CD 70.jpg']
          }
        ],
        rating: 4.2
      },
      {
        vehicleType: 'Motorcycle',
        name: 'Honda CG 125',
        category: 'Commuter',
        price: 275000,
        description: 'Popular commuter motorcycle with excellent performance and reliability',
        stockQuantity: 8,
        available: true,
        company: company._id,
        features: ['Fuel Efficient', 'Low Maintenance', 'Reliable Engine', 'Comfortable Ride'],
        specs: {
          'Engine': '125cc',
          'Mileage': '60 km/l',
          'Power': '8.5 HP',
          'Transmission': '4-Speed Manual'
        },
        colors: [
          {
            name: 'Red',
            hex: '#FF0000',
            images: ['/images/bikes/CG-125.jpg']
          }
        ],
        rating: 4.5
      },
      {
        vehicleType: 'Motorcycle',
        name: 'Suzuki GD 110',
        category: 'Commuter',
        price: 165000,
        description: 'Economical and practical motorcycle for daily commuting',
        stockQuantity: 5,
        available: true,
        company: company._id,
        features: ['Economical', 'Easy to Ride', 'Low Cost', 'Good Mileage'],
        specs: {
          'Engine': '110cc',
          'Mileage': '70 km/l',
          'Power': '7.5 HP',
          'Transmission': '4-Speed Manual'
        },
        colors: [
          {
            name: 'Black',
            hex: '#000000',
            images: ['/images/bikes/Suzuki GD 110.jpg']
          }
        ],
        rating: 4.0
      },
      {
        vehicleType: 'Motorcycle',
        name: 'Suzuki GS 125',
        category: 'Commuter',
        price: 220000,
        description: 'Stylish commuter motorcycle with good performance',
        stockQuantity: 6,
        available: true,
        company: company._id,
        features: ['Stylish Design', 'Good Performance', 'Comfortable Ride', 'Reliable'],
        specs: {
          'Engine': '125cc',
          'Mileage': '55 km/l',
          'Power': '8.2 HP',
          'Transmission': '5-Speed Manual'
        },
        colors: [
          {
            name: 'Blue',
            hex: '#0066CC',
            images: ['/images/bikes/Suzuki GS 125.jpg']
          }
        ],
        rating: 4.3
      },
      {
        vehicleType: 'Motorcycle',
        name: 'Yamaha YB 100',
        category: 'Commuter',
        price: 150000,
        description: 'Classic commuter motorcycle with proven reliability',
        stockQuantity: 3,
        available: true,
        company: company._id,
        features: ['Classic Design', 'Reliable', 'Easy Maintenance', 'Good Mileage'],
        specs: {
          'Engine': '100cc',
          'Mileage': '75 km/l',
          'Power': '6.5 HP',
          'Transmission': '4-Speed Manual'
        },
        colors: [
          {
            name: 'Green',
            hex: '#008000',
            images: ['/images/bikes/Yamaha YB 100.png']
          }
        ],
        rating: 4.1
      },
      {
        vehicleType: 'Motorcycle',
        name: 'Yamaha YBR 125',
        category: 'Commuter',
        price: 250000,
        description: 'Stylish and efficient commuter bike with modern features',
        stockQuantity: 10,
        available: true,
        company: company._id,
        features: ['Stylish Design', 'Good Performance', 'Comfortable Ride', 'Modern Features'],
        specs: {
          'Engine': '125cc',
          'Mileage': '55 km/l',
          'Power': '8.2 HP',
          'Transmission': '5-Speed Manual'
        },
        colors: [
          {
            name: 'Blue',
            hex: '#0000FF',
            images: ['/images/bikes/Yamaha YBR 125.png']
          }
        ],
        rating: 4.3
      },
      {
        vehicleType: 'Motorcycle',
        name: 'Yamaha R15 V4',
        category: 'Sports',
        price: 850000,
        description: 'High-performance sports motorcycle with advanced technology',
        stockQuantity: 4,
        available: true,
        company: company._id,
        features: ['High Performance', 'Sporty Design', 'Advanced Technology', 'Racing DNA'],
        specs: {
          'Engine': '155cc',
          'Mileage': '45 km/l',
          'Power': '18.4 HP',
          'Transmission': '6-Speed Manual'
        },
        colors: [
          {
            name: 'Racing Blue',
            hex: '#0066CC',
            images: ['/images/bikes/r15-v4.jpg']
          }
        ],
        rating: 4.8
      }
    ];

    // Clear existing vehicles
    await Vehicle.deleteMany({});
    console.log('Cleared existing vehicles');

    // Insert original vehicles
    const result = await Vehicle.insertMany(originalVehiclesData);
    console.log(`Successfully restored ${result.length} original vehicles`);

    // Log stock summary
    const totalStock = result.reduce((sum, vehicle) => sum + (vehicle.stockQuantity || 0), 0);
    console.log(`\nTotal stock across all vehicles: ${totalStock}`);
    
    console.log('\nRestored vehicles:');
    result.forEach(vehicle => {
      console.log(`- ${vehicle.name}: ${vehicle.stockQuantity || 0} units (LKR ${vehicle.price?.toLocaleString()})`);
    });

    console.log('\nOriginal vehicles restored successfully!');
  } catch (error) {
    console.error('Error restoring original vehicles:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

restoreOriginalVehicles(); 