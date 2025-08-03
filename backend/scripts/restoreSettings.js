const mongoose = require('mongoose');
const Setting = require('../models/Setting.js');
require('dotenv').config();

const defaultSettings = {
  bannerHeading: 'AKR & SONS (PVT) LTD',
  bannerSubheading: 'Your Trusted Partner in Two-Wheeler Solutions',
  email: 'info@akrsons.com',
  phone: '+94 77 311 1266',
  address: '123 Main Street, Colombo, Sri Lanka',
  socialLinks: {
    facebook: 'https://facebook.com',
    instagram: 'https://instagram.com',
    whatsapp: 'https://wa.me/94773111266',
    twitter: 'https://twitter.com'
  },
  specialOffers: [
    {
      title: 'Full Tank Petrol + Jacket + Helmet',
      description: 'Get a full tank of petrol, a stylish jacket, and a helmet with your new ride.',
      condition: 'Only for Ready Cash Payments',
      icon: 'gift'
    },
    {
      title: '15,000 LKR Discount',
      description: 'Enjoy an instant discount of 15,000 LKR on your purchase.',
      condition: 'Only for Ready Cash Payments',
      icon: 'dollar'
    },
    {
      title: 'Registration Fee Waived',
      description: 'We\'ll cover your registration fee for a hassle-free start.',
      condition: 'Only for Ready Cash Payments',
      icon: 'car'
    }
  ]
};

async function restoreSettings() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Clear existing settings
    await Setting.deleteMany({});
    console.log('Cleared existing settings');

    // Insert new settings
    const result = await Setting.create(defaultSettings);
    console.log('Successfully restored settings:');
    console.log(`- Banner Heading: ${result.bannerHeading}`);
    console.log(`- Email: ${result.email}`);
    console.log(`- Phone: ${result.phone}`);
    console.log(`- Special Offers: ${result.specialOffers.length} offers`);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error restoring settings:', error);
    process.exit(1);
  }
}

restoreSettings(); 