const mongoose = require('mongoose');
const BankDeposit = require('../models/BankDeposit');
require('dotenv').config({ path: './.env' });

const bankDepositsData = [
  { date: '2025-05-31', depositerName: '', accountNumber: '', accountName: 'A.Rojarstalin', purpose: 'bike store', quantity: 0, payment: 195000.00 },
  { date: '2025-05-31', depositerName: '', accountNumber: '', accountName: 'A.Rojarstalin', purpose: 'bike store', quantity: 0, payment: 130000.00 },
  { date: '2025-05-31', depositerName: '', accountNumber: '', accountName: 'A.Rojarstalin', purpose: 'bike store', quantity: 0, payment: 99000.00 },
  { date: '2025-05-31', depositerName: '', accountNumber: '', accountName: 'A.Rojarstalin', purpose: 'bike store', quantity: 0, payment: 200000.00 },
  { date: '2025-05-31', depositerName: '', accountNumber: '', accountName: 'A.Rojarstalin', purpose: 'bike store', quantity: 0, payment: 190000.00 },
  { date: '2025-05-30', depositerName: '', accountNumber: '', accountName: 'A.Rojarstalin', purpose: 'helmet', quantity: 1, payment: 3500.00 },
  { date: '2025-05-30', depositerName: '', accountNumber: '', accountName: 'A.Rojarstalin', purpose: 'oil', quantity: 1, payment: 2400.00 },
  { date: '2025-05-30', depositerName: '', accountNumber: '', accountName: 'A.Rojarstalin', purpose: 'oil', quantity: 1, payment: 2650.00 },
  { date: '2025-05-27', depositerName: '', accountNumber: '', accountName: 'A.Rojarstalin', purpose: 'bike store', quantity: 0, payment: 195000.00 },
  { date: '2025-05-27', depositerName: '', accountNumber: '', accountName: 'A.Rojarstalin', purpose: 'bike store', quantity: 0, payment: 10000.00 },
  { date: '2025-05-27', depositerName: '', accountNumber: '', accountName: 'A.Rojarstalin', purpose: 'bike store', quantity: 0, payment: 133000.00 },
  { date: '2025-05-22', depositerName: '', accountNumber: '', accountName: 'A.Rojarstalin', purpose: 'bike store', quantity: 0, payment: 200000.00 },
  { date: '2025-05-22', depositerName: '', accountNumber: '', accountName: 'A.Rojarstalin', purpose: 'bike store', quantity: 0, payment: 200000.00 },
  { date: '2025-05-22', depositerName: '', accountNumber: '', accountName: 'A.Rojarstalin', purpose: 'bike store', quantity: 0, payment: 200000.00 },
  { date: '2025-05-22', depositerName: '', accountNumber: '', accountName: 'A.Rojarstalin', purpose: 'bike store', quantity: 0, payment: 152000.00 },
  { date: '2025-05-22', depositerName: '', accountNumber: '', accountName: 'A.Rojarstalin', purpose: 'bike store', quantity: 0, payment: 200000.00 },
  { date: '2025-05-22', depositerName: '', accountNumber: '', accountName: 'A.Rojarstalin', purpose: 'bike store', quantity: 0, payment: 200000.00 },
  { date: '2025-05-22', depositerName: '', accountNumber: '', accountName: 'A.Rojarstalin', purpose: 'bike store', quantity: 0, payment: 200000.00 },
  { date: '2025-05-22', depositerName: '', accountNumber: '', accountName: 'A.Rojarstalin', purpose: 'bike store', quantity: 0, payment: 200000.00 },
  { date: '2025-05-22', depositerName: '', accountNumber: '', accountName: 'A.Rojarstalin', purpose: 'bike store', quantity: 0, payment: 200000.00 },
  { date: '2025-05-22', depositerName: '', accountNumber: '', accountName: 'A.Rojarstalin', purpose: 'bike store', quantity: 0, payment: 180000.00 },
  { date: '2025-05-22', depositerName: '', accountNumber: '', accountName: 'A.Rojarstalin', purpose: 'bike store', quantity: 0, payment: 200000.00 },
  { date: '2025-05-22', depositerName: '', accountNumber: '', accountName: 'A.Rojarstalin', purpose: 'bike store', quantity: 0, payment: 200000.00 },
  { date: '2025-05-15', depositerName: '', accountNumber: '', accountName: 'A.Rojarstalin', purpose: 'bike store', quantity: 0, payment: 185000.00 },
  { date: '2025-05-15', depositerName: '', accountNumber: '', accountName: '', purpose: '', quantity: 0, payment: 195000.00 },
  { date: '2025-05-15', depositerName: '', accountNumber: '', accountName: '', purpose: '', quantity: 0, payment: 190000.00 },
  { date: '2025-05-15', depositerName: '', accountNumber: '', accountName: '', purpose: '', quantity: 0, payment: 67500.00 },
  { date: '2025-05-15', depositerName: 'M.Theepan', accountNumber: '', accountName: '', purpose: '', quantity: 0, payment: 643000.00 },
  { date: '2025-06-03', depositerName: 'A.Thevarasa', accountNumber: '', accountName: 'A.Rojarstalin', purpose: 'bike store', quantity: 0, payment: 0.00 },
  { date: '2025-06-03', depositerName: '', accountNumber: '', accountName: 'Iyoobkhan', purpose: '', quantity: 0, payment: 95950.00 },
  { date: '2025-06-03', depositerName: '', accountNumber: '', accountName: 'kanistan', purpose: '', quantity: 0, payment: 300000.00 },
  { date: '2025-06-03', depositerName: '', accountNumber: '', accountName: 'Tharsha Kumar', purpose: '', quantity: 0, payment: 315000.00 },
  { date: '2025-06-03', depositerName: '', accountNumber: '', accountName: '', purpose: 'bike store', quantity: 0, payment: 185000.00 },
  { date: '2025-06-03', depositerName: '', accountNumber: '', accountName: '', purpose: 'bike store', quantity: 0, payment: 110000.00 },
  { date: '2025-06-04', depositerName: '', accountNumber: '', accountName: 'mariyalurthakaran', purpose: '', quantity: 0, payment: 200000.00 },
  { date: '2025-06-04', depositerName: '', accountNumber: '', accountName: '', purpose: 'bike store', quantity: 0, payment: 195000.00 },
  { date: '2025-06-06', depositerName: 'A.Thevarasa', accountNumber: '', accountName: 'A.Rojarstalin', purpose: 'mariyalurthakaran-1\'st instalment', quantity: 0, payment: 240000.00 },
  { date: '2025-06-12', depositerName: 'A.Thevarasa', accountNumber: '', accountName: 'A.Rojarstalin', purpose: 'bike store', quantity: 0, payment: 200000.00 },
  { date: '2025-06-12', depositerName: '', accountNumber: '', accountName: '', purpose: 'bike store', quantity: 0, payment: 1185000.00 },
  { date: '2025-06-12', depositerName: '', accountNumber: '', accountName: '', purpose: 'bike store', quantity: 0, payment: 21000.00 },
  { date: '2025-06-12', depositerName: '', accountNumber: '', accountName: '', purpose: 'bike store', quantity: 0, payment: 85000.00 },
  { date: '2025-06-17', depositerName: 'A.Thevarasa', accountNumber: '', accountName: 'A.Rojarstalin', purpose: 'bike store', quantity: 0, payment: 510000.00 },
  { date: '2025-06-18', depositerName: 'T.Thushyanthini', accountNumber: '', accountName: 'A.Rojarstalin', purpose: 'bike store', quantity: 0, payment: 585000.00 },
  { date: '2025-06-20', depositerName: 'A.Thevarasa', accountNumber: '', accountName: 'A.Rojarstalin', purpose: 'bike store', quantity: 0, payment: 6460000.00 },
  { date: '2025-06-24', depositerName: 'p.kujina', accountNumber: '', accountName: 'A.Rojarstalin', purpose: 'oil', quantity: 3, payment: 7200.00 },
  { date: '2025-06-24', depositerName: 'A.Thevarasa', accountNumber: '', accountName: '', purpose: 'bike store', quantity: 0, payment: 100000.00 },
  { date: '2025-06-24', depositerName: '', accountNumber: '', accountName: 'puvanenthiraaraja', purpose: '', quantity: 0, payment: 960000.00 },
  { date: '2025-06-24', depositerName: '', accountNumber: '', accountName: '', purpose: 'bike store', quantity: 0, payment: 190000.00 },
  { date: '2025-06-24', depositerName: '', accountNumber: '', accountName: '', purpose: 'bike store', quantity: 0, payment: 195000.00 },
  { date: '2025-06-24', depositerName: '', accountNumber: '', accountName: '', purpose: 'bike store', quantity: 0, payment: 97600.00 },
  { date: '2025-06-24', depositerName: '', accountNumber: '', accountName: '', purpose: 'bike store', quantity: 0, payment: 190000.00 },
  { date: '2025-06-24', depositerName: '', accountNumber: '', accountName: '', purpose: 'bike store', quantity: 0, payment: 44500.00 },
  { date: '2025-06-20', depositerName: 'A.Thevarasa', accountNumber: '', accountName: 'A.Rojarstalin', purpose: 'bike store', quantity: 0, payment: 646000.00 },
  { date: '2025-06-27', depositerName: 'A.Thevarasa', accountNumber: '', accountName: 'A.Rojarstalin', purpose: 'bike store', quantity: 0, payment: 870000.00 },
  { date: '2025-06-28', depositerName: 'A.Thevarasa', accountNumber: '', accountName: 'A.Rojarstalin', purpose: 'bike store', quantity: 0, payment: 195000.00 },
  { date: '2025-06-28', depositerName: '', accountNumber: '', accountName: '', purpose: 'bike store', quantity: 0, payment: 105200.00 },
  { date: '2025-06-28', depositerName: '', accountNumber: '', accountName: '', purpose: 'bike store', quantity: 0, payment: 75000.00 },
  { date: '2025-06-28', depositerName: '', accountNumber: '', accountName: '', purpose: 'bike store', quantity: 0, payment: 200000.00 },
  { date: '2025-06-28', depositerName: '', accountNumber: '', accountName: '', purpose: 'bike store', quantity: 0, payment: 195000.00 },
  { date: '2025-06-28', depositerName: '', accountNumber: '', accountName: '', purpose: 'bike store', quantity: 0, payment: 200000.00 },
  { date: '2025-06-28', depositerName: '', accountNumber: '', accountName: '', purpose: 'bike store', quantity: 0, payment: 200000.00 },
  { date: '2025-06-28', depositerName: '', accountNumber: '', accountName: '', purpose: 'bike store', quantity: 0, payment: 139000.00 },
  { date: '2025-06-30', depositerName: 'A.Thevarasa', accountNumber: '', accountName: 'A.Rojarstalin', purpose: 'bike store', quantity: 0, payment: 15000.00 },
  { date: '2025-07-01', depositerName: 'A.Thevarasa', accountNumber: '', accountName: 'A.Rojarstalin', purpose: 'bike store', quantity: 0, payment: 10000.00 },
  { date: '2025-07-01', depositerName: '', accountNumber: '', accountName: '', purpose: '', quantity: 0, payment: 25000.00 },
  { date: '2025-07-03', depositerName: 'A.Thevarasa', accountNumber: '', accountName: 'A.Rojarstalin', purpose: 'bike store', quantity: 0, payment: 795000.00 },
  { date: '2025-07-03', depositerName: '', accountNumber: '', accountName: '', purpose: 'bike advance', quantity: 0, payment: 20000.00 },
  { date: '2025-07-04', depositerName: 'A.Thevarasa', accountNumber: '', accountName: 'A.Rojarstalin', purpose: 'bike store', quantity: 0, payment: 200000.00 },
  { date: '2025-07-04', depositerName: '', accountNumber: '', accountName: '', purpose: '', quantity: 0, payment: 200000.00 },
  { date: '2025-07-04', depositerName: '', accountNumber: '', accountName: '', purpose: '', quantity: 0, payment: 5000.00 },
  { date: '2025-07-04', depositerName: '', accountNumber: '', accountName: '', purpose: '', quantity: 0, payment: 45000.00 },
  { date: '2025-07-04', depositerName: '', accountNumber: '', accountName: '', purpose: '', quantity: 0, payment: 198500.00 },
  { date: '2025-07-07', depositerName: 'A.Thevarasa', accountNumber: '', accountName: 'A.Rojarstalin', purpose: 'bike store', quantity: 0, payment: 378500.00 },
  { date: '2025-07-11', depositerName: 'A.Thevarasa', accountNumber: '', accountName: 'A.Rojarstalin', purpose: 'bike store', quantity: 0, payment: 40000.00 },
  { date: '2025-07-14', depositerName: 'A.Thevarasa', accountNumber: '', accountName: 'A.Rojarstalin', purpose: 'bike store', quantity: 0, payment: 190000.00 },
  { date: '2025-07-14', depositerName: '', accountNumber: '', accountName: '', purpose: '', quantity: 0, payment: 185000.00 },
  { date: '2025-07-14', depositerName: '', accountNumber: '', accountName: '', purpose: '', quantity: 0, payment: 33000.00 },
  { date: '2025-07-14', depositerName: '', accountNumber: '', accountName: '', purpose: 'fund transfer', quantity: 0, payment: 542150.00 },
  { date: '2025-07-14', depositerName: '', accountNumber: '', accountName: '', purpose: 'bike store', quantity: 0, payment: 217000.00 },
  { date: '2025-07-16', depositerName: 'A.Thevarasa', accountNumber: '', accountName: 'A.Rojarstalin', purpose: 'bike store', quantity: 0, payment: 728650.00 },
  { date: '2025-07-16', depositerName: '', accountNumber: '', accountName: 'marijohn', purpose: '', quantity: 0, payment: 648150.00 },
  { date: '2025-07-17', depositerName: 'A.Thevarasa', accountNumber: '', accountName: 'A.Rojarstalin', purpose: 'bike store', quantity: 0, payment: 22000.00 },
  { date: '2025-07-17', depositerName: '', accountNumber: '', accountName: '', purpose: '', quantity: 0, payment: 200000.00 },
  { date: '2025-07-19', depositerName: 'A.Thevarasa', accountNumber: '', accountName: 'A.Rojarstalin', purpose: 'bike store', quantity: 0, payment: 115000.00 },
  { date: '2025-07-19', depositerName: '', accountNumber: '', accountName: '', purpose: '', quantity: 0, payment: 120000.00 },
  { date: '2025-07-19', depositerName: '', accountNumber: '', accountName: '', purpose: '', quantity: 0, payment: 200000.00 },
  { date: '2025-07-19', depositerName: '', accountNumber: '', accountName: '', purpose: '', quantity: 0, payment: 200000.00 },
  { date: '2025-07-19', depositerName: '', accountNumber: '', accountName: '', purpose: '', quantity: 0, payment: 200000.00 },
  { date: '2025-07-19', depositerName: '', accountNumber: '', accountName: '', purpose: '', quantity: 0, payment: 197500.00 },
  { date: '2025-07-19', depositerName: '', accountNumber: '', accountName: '', purpose: '', quantity: 0, payment: 15000.00 },
  { date: '2025-07-19', depositerName: '', accountNumber: '', accountName: '', purpose: '', quantity: 0, payment: 195500.00 },
  { date: '2025-07-21', depositerName: 'A.Thevarasa', accountNumber: '', accountName: 'A.Rojarstalin', purpose: 'bike store', quantity: 0, payment: 145000.00 },
  { date: '2025-07-21', depositerName: '', accountNumber: '', accountName: 'mariyanayagi balance payment', purpose: '', quantity: 0, payment: 30000.00 },
  { date: '2025-07-21', depositerName: '', accountNumber: '', accountName: 'judedemiyan', purpose: '', quantity: 0, payment: 1140000.00 },
  { date: '2025-07-22', depositerName: 'A.Thevarasa', accountNumber: '', accountName: 'A.Rojarstalin', purpose: 'bike store', quantity: 0, payment: 21000.00 },
  { date: '2025-07-22', depositerName: '', accountNumber: '', accountName: '', purpose: '', quantity: 0, payment: 1088150.00 },
  { date: '2025-07-25', depositerName: 'A.Thevarasa', accountNumber: '', accountName: 'A.Rojarstalin', purpose: 'bike store', quantity: 0, payment: 1140000.00 }
];

async function seedBankDeposits() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected for seeding bank deposits');

    // Check if data already exists
    const existingCount = await BankDeposit.countDocuments();
    if (existingCount > 0) {
      console.log(`Bank deposits already exist (${existingCount} records). Skipping seeding.`);
      process.exit(0);
    }

    // Insert bank deposits
    const result = await BankDeposit.insertMany(bankDepositsData);
    console.log(`Successfully seeded ${result.length} bank deposits`);

    // Get statistics
    const stats = await BankDeposit.aggregate([
      {
        $group: {
          _id: null,
          totalPayment: { $sum: '$payment' },
          totalQuantity: { $sum: '$quantity' },
          count: { $sum: 1 }
        }
      }
    ]);

    if (stats.length > 0) {
      console.log('Bank Deposit Statistics:');
      console.log(`Total Payment: LKR ${stats[0].totalPayment.toLocaleString()}`);
      console.log(`Total Quantity: ${stats[0].totalQuantity}`);
      console.log(`Total Records: ${stats[0].count}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error seeding bank deposits:', error);
    process.exit(1);
  }
}

seedBankDeposits(); 