const mongoose = require('mongoose');
const Company = require('../models/Company.cjs');
require('dotenv').config();

const companies = [
  {
    _id: '686e05c8f245342ad54d6eb9',
    name: 'AKR & SONS (PVT) LTD',
    description: 'Premium Motorcycles and Vehicle Management',
    vehicles: [],
    createdAt: new Date('2025-07-09T06:01:44.634+00:00'),
    __v: 22
  },
  {
    _id: '686e05c8f245342ad54d6ebc',
    name: 'AKR Multi Complex',
    description: 'Modern commercial and residential complex offering premium spaces for businesses and families',
    vehicles: [],
    createdAt: new Date('2025-07-09T06:01:44.809+00:00'),
    __v: 0
  },
  {
    _id: '686e05c8f245342ad54d6ebf',
    name: 'AKR Construction',
    description: 'Professional construction company delivering high-quality infrastructure projects',
    vehicles: [],
    createdAt: new Date('2025-07-09T06:01:44.993+00:00'),
    __v: 0
  },
  {
    _id: '686e06be32033b442169409b',
    name: 'AKR Lanka Filling Station',
    description: 'Reliable fuel station providing quality petroleum products and automotive services',
    vehicles: [],
    createdAt: new Date('2025-07-09T06:05:50.069+00:00'),
    __v: 0
  },
  {
    _id: '686e06be32033b442169409e',
    name: 'AKR Wine Store',
    description: 'Premium wine retail store offering carefully curated selection of fine wines and spirits',
    vehicles: [],
    createdAt: new Date('2025-07-09T06:05:50.229+00:00'),
    __v: 0
  },
  {
    _id: '686e06be32033b44216940a1',
    name: 'AKR Farm',
    description: 'Sustainable agricultural enterprise focusing on organic farming practices and local food production',
    vehicles: [],
    createdAt: new Date('2025-07-09T06:05:50.377+00:00'),
    __v: 0
  },
  {
    _id: '686e06be32033b44216940a4',
    name: 'AKR\'S Amma Organization',
    description: 'Dedicated social organization committed to community development, charitable activities, and social welfare',
    vehicles: [],
    createdAt: new Date('2025-07-09T06:05:50.543+00:00'),
    __v: 0
  },
  {
    _id: '686e06be32033b44216940a7',
    name: 'AKR Easy Credit (Pvt) Ltd',
    description: 'Reliable financial services provider offering easy credit solutions, personal loans, and financial assistance',
    vehicles: [],
    createdAt: new Date('2025-07-09T06:05:50.732+00:00'),
    __v: 0
  }
];

async function restoreCompanies() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Clear existing companies
    await Company.deleteMany({});
    console.log('Cleared existing companies');

    // Insert new companies with exact original data
    const result = await Company.insertMany(companies);
    console.log(`Successfully restored ${result.length} companies:`);
    
    result.forEach(company => {
      console.log(`- ${company.name} (ID: ${company._id})`);
      console.log(`  Description: ${company.description}`);
      console.log(`  Created: ${company.createdAt}`);
      console.log(`  Version: ${company.__v}`);
      console.log('');
    });

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error restoring companies:', error);
    process.exit(1);
  }
}

restoreCompanies(); 