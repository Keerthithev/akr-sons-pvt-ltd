const mongoose = require('mongoose');
const User = require('../models/User.cjs');
require('dotenv').config();

const adminUser = {
  name: 'Admin',
  email: 'admin@akrsons.com',
  password: 'admin123',
  isAdmin: true
};

async function seedAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminUser.email });
    
    if (existingAdmin) {
      console.log('Admin user already exists:');
      console.log(`- Name: ${existingAdmin.name}`);
      console.log(`- Email: ${existingAdmin.email}`);
      console.log(`- Admin: ${existingAdmin.isAdmin}`);
      console.log(`- Created: ${existingAdmin.createdAt}`);
    } else {
      // Create new admin user
      const newAdmin = await User.create(adminUser);
      console.log('Successfully created admin user:');
      console.log(`- Name: ${newAdmin.name}`);
      console.log(`- Email: ${newAdmin.email}`);
      console.log(`- Admin: ${newAdmin.isAdmin}`);
      console.log(`- Created: ${newAdmin.createdAt}`);
      console.log('\nLogin Credentials:');
      console.log(`Email: ${adminUser.email}`);
      console.log(`Password: ${adminUser.password}`);
    }

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
}

seedAdmin(); 