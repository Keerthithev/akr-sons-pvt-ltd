const mongoose = require('mongoose');
const Customer = require('../models/Customer');
require('dotenv').config({ path: './.env' });

const customerData = [
  {
    fullName: 'Sebasthiyan Thanusan',
    nicDrivingLicense: '992784164V',
    phoneNo: '778270783',
    address: 'Kaththankulam, Vaddakkandal',
    language: 'Tamil',
    occupation: 'Farmer',
    dateOfPurchase: new Date('2025-01-06')
  },
  {
    fullName: 'S.M.Hilmi',
    nicDrivingLicense: '',
    phoneNo: '',
    address: 'Kulankulam, Chilawaththurai',
    language: 'Tamil',
    occupation: 'Farmer',
    dateOfPurchase: new Date('2025-01-06')
  },
  {
    fullName: 'M.Siddik Ruwaisdeen',
    nicDrivingLicense: '781161985V',
    phoneNo: '776181914',
    address: 'Marichchukaddi, Palaikuli',
    language: 'Tamil',
    occupation: 'Farmer',
    dateOfPurchase: new Date('2025-01-09')
  },
  {
    fullName: 'Viyan Sayanthan',
    nicDrivingLicense: '200008103350',
    phoneNo: '',
    address: '48, 2nd port, Aninjankulam, Yogapuram.',
    language: 'Tamil',
    occupation: 'Student',
    dateOfPurchase: new Date('2025-01-09')
  },
  {
    fullName: 'Abdul Jabbar Mohemmed Haneefa',
    nicDrivingLicense: '851574565V',
    phoneNo: '772953413',
    address: 'Pichchaivanifa, Nedunkulam, Weppankulam, Musali, Mannar',
    language: 'Tamil',
    occupation: 'Farmer',
    dateOfPurchase: new Date('2025-01-10')
  },
  {
    fullName: 'Mathadimai Jekanesan',
    nicDrivingLicense: '810701722V',
    phoneNo: '773603240',
    address: 'Mathakiramam, Madhu Road',
    language: 'Tamil',
    occupation: 'Farmer',
    dateOfPurchase: new Date('2025-01-11')
  },
  {
    fullName: 'Salaphthin Muhamad Safan',
    nicDrivingLicense: '200123200464',
    phoneNo: '',
    address: '51, 3rd cross, New Moor Street, Aralli Road, Jaffan',
    language: 'Tamil',
    occupation: 'Student',
    dateOfPurchase: new Date('2025-01-13')
  },
  {
    fullName: 'Josep Victor Pathmaraja Priyatharsan',
    nicDrivingLicense: '199719962212',
    phoneNo: '765490311',
    address: 'Naruvilikulam, Vankalai',
    language: 'Tamil',
    occupation: 'Farmer',
    dateOfPurchase: new Date('2025-01-18')
  },
  {
    fullName: 'Thuraraj Thanasekar',
    nicDrivingLicense: '840742962V',
    phoneNo: '761231984',
    address: 'Kariyalai, Nakapadovan, Pallavatajankaddo',
    language: 'Tamil',
    occupation: 'Bussinesman',
    dateOfPurchase: new Date('2025-01-25')
  },
  {
    fullName: 'Pihille Gepava Dammika Thotawatta',
    nicDrivingLicense: '198120404796',
    phoneNo: '777087000',
    address: '6 98/96 Kangolla Plessa, Kurunegala',
    language: 'Tamil',
    occupation: 'Bussinesman',
    dateOfPurchase: new Date('2025-01-31')
  },
  {
    fullName: 'Sapanathan Disanthan',
    nicDrivingLicense: '200027900268',
    phoneNo: '772608531',
    address: 'Kuruparan road mulankavil',
    language: 'Tamil',
    occupation: 'Employee',
    dateOfPurchase: new Date('2025-02-08')
  },
  {
    fullName: 'V.Mageswaran',
    nicDrivingLicense: '802833873V',
    phoneNo: '',
    address: 'Kurukulm Road, Jeyapuram South',
    language: 'Tamil',
    occupation: 'C.S.D',
    dateOfPurchase: new Date('2025-02-12')
  },
  {
    fullName: 'M. VivekanaNthan',
    nicDrivingLicense: '792514545V',
    phoneNo: '765423062',
    address: 'Sinnapadivirichan',
    language: 'Tamil',
    occupation: 'Irrigation Department Officer',
    dateOfPurchase: new Date('2025-02-07')
  },
  {
    fullName: 'S.M. Paseer',
    nicDrivingLicense: '197809204837',
    phoneNo: '771422926',
    address: 'Pandaraveli, Mannar',
    language: 'Tamil',
    occupation: 'Businessman',
    dateOfPurchase: new Date('2025-02-14')
  },
  {
    fullName: 'Mohamed ali mohamed natheem',
    nicDrivingLicense: '200294003077',
    phoneNo: '762098555',
    address: 'Pichchivanipanedankula, Vepankulam, PP Potkerny',
    language: 'Tamil',
    occupation: 'Driver',
    dateOfPurchase: new Date('2025-02-21')
  },
  {
    fullName: 'Sivarasa Niroja',
    nicDrivingLicense: '917023409V',
    phoneNo: '777606165',
    address: '8Ward, No 04 Velni, Jaffna',
    language: 'Tamil',
    occupation: 'Farmar',
    dateOfPurchase: new Date('2025-02-20')
  },
  {
    fullName: 'Emileyanspillai Steevanraj',
    nicDrivingLicense: '933622673V',
    phoneNo: '769774490',
    address: 'Achchankulam, Nanattan',
    language: 'Tamil',
    occupation: 'Agriculture Department',
    dateOfPurchase: new Date('2025-02-21')
  },
  {
    fullName: 'A. Mithushan',
    nicDrivingLicense: '99149032V',
    phoneNo: '779620014',
    address: 'Kovil Road, Uyilankulam',
    language: 'Tamil',
    occupation: 'Farmar',
    dateOfPurchase: new Date('2025-02-19')
  },
  {
    fullName: 'Pathmanathan Suventhiran',
    nicDrivingLicense: '198027104882',
    phoneNo: '777279141',
    address: '155 solai, Pallavarajan Kaddu',
    language: 'Tamil',
    occupation: 'Farmar',
    dateOfPurchase: new Date('2025-02-18')
  },
  {
    fullName: 'Satheeskumar Jathursan',
    nicDrivingLicense: '200011300086',
    phoneNo: '',
    address: 'Kulavisuddan, Nedunkerhy',
    language: 'Tamil',
    occupation: 'Farmar',
    dateOfPurchase: new Date('2025-02-18')
  },
  {
    fullName: 'Navarathnam Ramesh',
    nicDrivingLicense: '198133303988',
    phoneNo: '775026175',
    address: 'Uyirtharasankulam, Murungan',
    language: 'Tamil',
    occupation: 'DS Office employe',
    dateOfPurchase: new Date('2025-02-07')
  }
];

async function seedCustomers() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Clear existing customers
    await Customer.deleteMany({});
    console.log('✅ Cleared existing customers');

    // Insert new customer data
    const result = await Customer.insertMany(customerData);
    console.log(`✅ Successfully seeded ${result.length} customer records`);

    // Get statistics
    const stats = await Customer.aggregate([
      {
        $group: {
          _id: null,
          totalCustomers: { $sum: 1 },
          totalWithPhone: { $sum: { $cond: [{ $ne: ['$phoneNo', ''] }, 1, 0] } },
          totalWithNIC: { $sum: { $cond: [{ $ne: ['$nicDrivingLicense', ''] }, 1, 0] } }
        }
      }
    ]);

    const languageStats = await Customer.aggregate([
      {
        $group: {
          _id: '$language',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const occupationStats = await Customer.aggregate([
      {
        $group: {
          _id: '$occupation',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const resultStats = stats[0] || { totalCustomers: 0, totalWithPhone: 0, totalWithNIC: 0 };

    console.log('\n=== CUSTOMER SUMMARY ===');
    console.log(`Total Customers: ${resultStats.totalCustomers}`);
    console.log(`Customers with Phone: ${resultStats.totalWithPhone}`);
    console.log(`Customers with NIC: ${resultStats.totalWithNIC}`);

    console.log('\n=== LANGUAGE STATISTICS ===');
    languageStats.forEach(stat => {
      console.log(`${stat._id}: ${stat.count} customers`);
    });

    console.log('\n=== OCCUPATION STATISTICS ===');
    occupationStats.forEach(stat => {
      console.log(`${stat._id}: ${stat.count} customers`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding customers:', error);
    process.exit(1);
  }
}

seedCustomers(); 