const mongoose = require('mongoose');
const dotenv = require('dotenv');
const SalesTransaction = require('../models/SalesTransaction');

// Load environment variables
dotenv.config({ path: './.env' });

// Sample sales transactions data based on the user's specification
const salesTransactionsData = [
  // January 2025
  {
    invoiceNo: 'INV-001',
    bikeId: 'BIKE-001',
    customerName: 'Sebasthiyan Thanusan',
    salesDate: new Date('2025-01-06'),
    salespersonName: 'janavery',
    sellingPrice: 275000,
    discountApplied: 0,
    finalAmount: 275000,
    paymentMethod: 'Cash',
    paymentStatus: 'Paid',
    warrantyPeriod: '2 Years',
    freeServiceDetails: '3 Free Services'
  },
  {
    invoiceNo: 'INV-002',
    bikeId: 'BIKE-002',
    customerName: 'S.M.Hilmi',
    salesDate: new Date('2025-01-06'),
    salespersonName: 'janavery',
    sellingPrice: 50000,
    discountApplied: 0,
    finalAmount: 50000,
    paymentMethod: 'Cash',
    paymentStatus: 'Paid',
    warrantyPeriod: '1 Year',
    freeServiceDetails: '2 Free Services'
  },
  {
    invoiceNo: 'INV-003',
    bikeId: 'BIKE-003',
    customerName: 'M.Siddik Ruwaisdeen',
    salesDate: new Date('2025-01-09'),
    salespersonName: 'janavery',
    sellingPrice: 178000,
    discountApplied: 0,
    finalAmount: 178000,
    paymentMethod: 'Cash',
    paymentStatus: 'Paid',
    warrantyPeriod: '2 Years',
    freeServiceDetails: '3 Free Services'
  },
  {
    invoiceNo: 'INV-004',
    bikeId: 'BIKE-004',
    customerName: 'Viyan Sayanthan',
    salesDate: new Date('2025-01-09'),
    salespersonName: 'janavery',
    sellingPrice: 642960,
    discountApplied: 0,
    finalAmount: 642960,
    paymentMethod: 'Cash',
    paymentStatus: 'Paid',
    warrantyPeriod: '2 Years',
    freeServiceDetails: '3 Free Services'
  },
  {
    invoiceNo: 'INV-005',
    bikeId: 'BIKE-005',
    customerName: 'Abdul Jabbar Mohemmed Haneefa',
    salesDate: new Date('2025-01-10'),
    salespersonName: 'janavery',
    sellingPrice: 150000,
    discountApplied: 0,
    finalAmount: 150000,
    paymentMethod: 'Cash',
    paymentStatus: 'Paid',
    warrantyPeriod: '2 Years',
    freeServiceDetails: '3 Free Services'
  },
  {
    invoiceNo: 'INV-006',
    bikeId: 'BIKE-006',
    customerName: 'Mathadimai Jekanesan',
    salesDate: new Date('2025-01-11'),
    salespersonName: 'janavery',
    sellingPrice: 400000,
    discountApplied: 0,
    finalAmount: 400000,
    paymentMethod: 'Cash',
    paymentStatus: 'Paid',
    warrantyPeriod: '2 Years',
    freeServiceDetails: '3 Free Services'
  },
  {
    invoiceNo: 'INV-007',
    bikeId: 'BIKE-007',
    customerName: 'Salaphthin Muhamad Safan',
    salesDate: new Date('2025-01-13'),
    salespersonName: 'janavery',
    sellingPrice: 150000,
    discountApplied: 0,
    finalAmount: 150000,
    paymentMethod: 'Cash',
    paymentStatus: 'Paid',
    warrantyPeriod: '2 Years',
    freeServiceDetails: '3 Free Services'
  },
  {
    invoiceNo: 'INV-008',
    bikeId: 'BIKE-008',
    customerName: 'Josep Victor Pathmaraja Priyatharsan',
    salesDate: new Date('2025-01-18'),
    salespersonName: 'janavery',
    sellingPrice: 700000,
    discountApplied: 0,
    finalAmount: 700000,
    paymentMethod: 'Cash',
    paymentStatus: 'Paid',
    warrantyPeriod: '2 Years',
    freeServiceDetails: '3 Free Services'
  },
  {
    invoiceNo: 'INV-009',
    bikeId: 'BIKE-009',
    customerName: 'Thuraraj Thanasekar',
    salesDate: new Date('2025-01-25'),
    salespersonName: 'janavery',
    sellingPrice: 5000,
    discountApplied: 0,
    finalAmount: 5000,
    paymentMethod: 'Cash',
    paymentStatus: 'Paid',
    warrantyPeriod: '1 Year',
    freeServiceDetails: '1 Free Service'
  },
  {
    invoiceNo: 'INV-010',
    bikeId: 'BIKE-010',
    customerName: 'Pihille Gepava Dammika Thotawatta',
    salesDate: new Date('2025-01-31'),
    salespersonName: 'janavery',
    sellingPrice: 292500,
    discountApplied: 0,
    finalAmount: 292500,
    paymentMethod: 'Cash',
    paymentStatus: 'Paid',
    warrantyPeriod: '2 Years',
    freeServiceDetails: '3 Free Services'
  },
  // February 2025
  {
    invoiceNo: 'INV-011',
    bikeId: 'BIKE-011',
    customerName: 'Sapanathan Disanthan',
    salesDate: new Date('2025-02-08'),
    salespersonName: 'janavery',
    sellingPrice: 650000,
    discountApplied: 0,
    finalAmount: 650000,
    paymentMethod: 'Cash',
    paymentStatus: 'Paid',
    warrantyPeriod: '2 Years',
    freeServiceDetails: '3 Free Services'
  },
  {
    invoiceNo: 'INV-012',
    bikeId: 'BIKE-012',
    customerName: 'V.Mageswaran',
    salesDate: new Date('2025-02-12'),
    salespersonName: 'janavery',
    sellingPrice: 300000,
    discountApplied: 0,
    finalAmount: 300000,
    paymentMethod: 'Cash',
    paymentStatus: 'Paid',
    warrantyPeriod: '2 Years',
    freeServiceDetails: '3 Free Services'
  },
  {
    invoiceNo: 'INV-013',
    bikeId: 'BIKE-013',
    customerName: 'M. VivekanaNthan',
    salesDate: new Date('2025-02-07'),
    salespersonName: 'janavery',
    sellingPrice: 250000,
    discountApplied: 0,
    finalAmount: 250000,
    paymentMethod: 'Cash',
    paymentStatus: 'Paid',
    warrantyPeriod: '2 Years',
    freeServiceDetails: '3 Free Services'
  },
  {
    invoiceNo: 'INV-014',
    bikeId: 'BIKE-014',
    customerName: 'S.M. Paseer',
    salesDate: new Date('2025-02-14'),
    salespersonName: 'janavery',
    sellingPrice: 996000,
    discountApplied: 0,
    finalAmount: 996000,
    paymentMethod: 'Cash',
    paymentStatus: 'Paid',
    warrantyPeriod: '2 Years',
    freeServiceDetails: '3 Free Services'
  },
  {
    invoiceNo: 'INV-015',
    bikeId: 'BIKE-015',
    customerName: 'Mohamed ali mohamed natheem',
    salesDate: new Date('2025-02-21'),
    salespersonName: 'janavery',
    sellingPrice: 500000,
    discountApplied: 0,
    finalAmount: 500000,
    paymentMethod: 'Cash',
    paymentStatus: 'Paid',
    warrantyPeriod: '2 Years',
    freeServiceDetails: '3 Free Services'
  },
  {
    invoiceNo: 'INV-016',
    bikeId: 'BIKE-016',
    customerName: 'Sivarasa Niroja',
    salesDate: new Date('2025-02-20'),
    salespersonName: 'janavery',
    sellingPrice: 750000,
    discountApplied: 0,
    finalAmount: 750000,
    paymentMethod: 'Cash',
    paymentStatus: 'Paid',
    warrantyPeriod: '2 Years',
    freeServiceDetails: '3 Free Services'
  },
  {
    invoiceNo: 'INV-017',
    bikeId: 'BIKE-017',
    customerName: 'Emileyanspillai Steevanraj',
    salesDate: new Date('2025-02-21'),
    salespersonName: 'janavery',
    sellingPrice: 226000,
    discountApplied: 0,
    finalAmount: 226000,
    paymentMethod: 'Cash',
    paymentStatus: 'Paid',
    warrantyPeriod: '2 Years',
    freeServiceDetails: '3 Free Services'
  },
  {
    invoiceNo: 'INV-018',
    bikeId: 'BIKE-018',
    customerName: 'A. Mithushan',
    salesDate: new Date('2025-02-19'),
    salespersonName: 'janavery',
    sellingPrice: 150000,
    discountApplied: 0,
    finalAmount: 150000,
    paymentMethod: 'Cash',
    paymentStatus: 'Paid',
    warrantyPeriod: '2 Years',
    freeServiceDetails: '3 Free Services'
  },
  {
    invoiceNo: 'INV-019',
    bikeId: 'BIKE-019',
    customerName: 'Pathmanathan Suventhiran',
    salesDate: new Date('2025-02-18'),
    salespersonName: 'janavery',
    sellingPrice: 200000,
    discountApplied: 0,
    finalAmount: 200000,
    paymentMethod: 'Cash',
    paymentStatus: 'Paid',
    warrantyPeriod: '2 Years',
    freeServiceDetails: '3 Free Services'
  },
  {
    invoiceNo: 'INV-020',
    bikeId: 'BIKE-020',
    customerName: 'Satheeskumar Jathursan',
    salesDate: new Date('2025-02-18'),
    salespersonName: 'janavery',
    sellingPrice: 240000,
    discountApplied: 0,
    finalAmount: 240000,
    paymentMethod: 'Cash',
    paymentStatus: 'Paid',
    warrantyPeriod: '2 Years',
    freeServiceDetails: '3 Free Services'
  },
  {
    invoiceNo: 'INV-021',
    bikeId: 'BIKE-021',
    customerName: 'Navarathnam Ramesh',
    salesDate: new Date('2025-02-07'),
    salespersonName: 'janavery',
    sellingPrice: 125000,
    discountApplied: 0,
    finalAmount: 125000,
    paymentMethod: 'Cash',
    paymentStatus: 'Paid',
    warrantyPeriod: '2 Years',
    freeServiceDetails: '3 Free Services'
  }
];

const seedSalesTransactions = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Clear existing sales transactions
    await SalesTransaction.deleteMany({});
    console.log('Cleared existing sales transactions');

    // Insert new sales transactions
    const result = await SalesTransaction.insertMany(salesTransactionsData);
    console.log(`Successfully seeded ${result.length} sales transactions`);

    // Get statistics
    const stats = await SalesTransaction.aggregate([
      {
        $group: {
          _id: null,
          totalTransactions: { $sum: 1 },
          totalSellingPrice: { $sum: '$sellingPrice' },
          totalDiscountApplied: { $sum: '$discountApplied' },
          totalFinalAmount: { $sum: '$finalAmount' }
        }
      }
    ]);

    if (stats.length > 0) {
      console.log('\nSales Transactions Statistics:');
      console.log(`Total Transactions: ${stats[0].totalTransactions}`);
      console.log(`Total Selling Price: LKR ${stats[0].totalSellingPrice.toLocaleString()}`);
      console.log(`Total Discount Applied: LKR ${stats[0].totalDiscountApplied.toLocaleString()}`);
      console.log(`Total Final Amount: LKR ${stats[0].totalFinalAmount.toLocaleString()}`);
    }

    console.log('\nSales transactions seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding sales transactions:', error);
    process.exit(1);
  }
};

// Run the seeding function
seedSalesTransactions(); 