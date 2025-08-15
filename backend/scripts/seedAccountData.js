const mongoose = require('mongoose');
const AccountData = require('../models/AccountData');
require('dotenv').config();

const accountData = [
  { date: '2025-05-03', name: 'A.S.Haidar', details: 'Bike down payment', amount: 275000 },
  { date: '2025-05-08', name: 'T.Sulaxshana', details: 'Auto advance payment', amount: 50000 },
  { date: '2025-05-14', name: 'vimalnayakam', details: 'Lease instalment', amount: 178000 },
  { date: '2025-05-15', name: 'J.S. Perera', details: 'Bike payment', amount: 642960 },
  { date: '2025-05-15', name: 'S.Subarnan', details: 'Bike down payment', amount: 150000 },
  { date: '2025-05-15', name: 'L.Lasinton', details: 'Bike down payment', amount: 400000 },
  { date: '2025-05-15', name: 'K.Thurshnakum', details: 'Bike down payment', amount: 150000 },
  { date: '2025-05-15', name: 'Show room', details: 'Helmet, oil', amount: 9520 },
  { date: '2025-05-19', name: 'S.Susmithan', details: 'Bike down payment', amount: 700000 },
  { date: '2025-05-19', name: 'S.Thowfeek', details: 'booking payment', amount: 5000 },
  { date: '2025-05-19', name: 'K.M.Rilas', details: 'Bike down payment', amount: 292500 },
  { date: '2025-05-19', name: 'N.M.Jamees', details: 'Bike down payment', amount: 650000 },
  { date: '2025-05-19', name: 'Andrew', details: 'Bike down payment', amount: 150000 },
  { date: '2025-05-20', name: 'M.M.Thaseem', details: 'Bike down payment', amount: 300000 },
  { date: '2025-05-20', name: 'C.Richadly', details: 'Bike down payment', amount: 250000 },
  { date: '2025-05-22', name: 'J.S. Perera', details: 'Instalment', amount: 100000 },
  { date: '2025-05-22', name: 'sithik', details: 'Bike down payment', amount: 996000 },
  { date: '2025-05-22', name: 'P.Vickneshwar', details: 'Bike down payment', amount: 500000 },
  { date: '2025-05-22', name: 'P.Puvannenthiran', details: 'Bike down payment', amount: 750000 },
  { date: '2025-05-23', name: 'Show room', details: 'helmet', amount: 3500 },
  { date: '2025-05-24', name: 'Show room', details: 'bike oil', amount: 2400 },
  { date: '2025-05-24', name: 'Show room', details: 'bike oil', amount: 2650 },
  { date: '2025-05-27', name: 'L.A.N.Khan', details: 'Bike down payment', amount: 226000 },
  { date: '2025-05-27', name: 'K.Jude jansan', details: 'Bike down payment', amount: 150000 },
  { date: '2025-05-29', name: 'M.M.Thaseem', details: 'Bike down payment', amount: 200000 },
  { date: '2025-05-31', name: 'T.J.Rajeevan', details: 'Bike down payment', amount: 742000 },
  { date: '2025-05-31', name: 'N.Nirojan', details: 'Advance payment', amount: 100000 },
  { date: '2025-06-02', name: 'S.Iyoobkhan', details: 'Bike payment', amount: 995950 },
  { date: '2025-06-02', name: 'A.kanistan', details: 'Bike down payment', amount: 300000 },
  { date: '2025-06-02', name: 'J.Tharshakumar', details: 'bike advence payment', amount: 315000 },
  { date: '2025-06-02', name: 'N.Nirojan', details: 'Bike down payment', amount: 153000 },
  { date: '2025-06-02', name: 'T.Asrahali', details: 'Bike down payment', amount: 295000 },
  { date: '2025-06-04', name: 'M.Mariyalurthakaran', details: 'Bike down payment', amount: 200000 },
  { date: '2025-06-06', name: 'M.Mariyalurthakaran', details: 'bike balance payment', amount: 240000 },
  { date: '2025-06-07', name: 'Dammikka', details: 'bike balance payment', amount: 125000 },
  { date: '2025-06-10', name: 'Mohamed Irshad', details: 'Bike payment', amount: 261010 },
  { date: '2025-06-10', name: 'V.Vinothini', details: 'bike advence payment', amount: 120000 },
  { date: '2025-06-11', name: 'Anthoyraj', details: 'Advance payment', amount: 106000 },
  { date: '2025-06-12', name: 'M.Mariyalurthakaran', details: 'Bike payment', amount: 290000 },
  { date: '2025-06-17', name: 'p.j.printon', details: 'Bike payment', amount: 231000 },
  { date: '2025-06-17', name: 'P.vikneshwaran', details: 'Lease payment', amount: 510000 },
  { date: '2025-06-17', name: 'A.Printan lembed', details: 'Advance payment', amount: 350000 },
  { date: '2025-06-20', name: 'S.Soosainayagam', details: 'Bike payment', amount: 645950 },
  { date: '2025-06-20', name: '', details: 'oil', amount: 2500 },
  { date: '2025-06-20', name: 'A.Jasotharan', details: 'Bike payment', amount: 200000 },
  { date: '2025-06-21', name: 'K.Jude jansan', details: 'Bike payment', amount: 11000 },
  { date: '2025-06-21', name: '', details: 'oil', amount: 2500 },
  { date: '2025-06-21', name: 'S.Judles Figurad', details: 'Bike down payment', amount: 400000 },
  { date: '2025-06-23', name: 'S.Judles Figurad(julien)', details: 'bike balance payment', amount: 100000 },
  { date: '2025-06-23', name: '', details: 'oil', amount: 4700 },
  { date: '2025-06-24', name: 'V.Ajin', details: 'Bike down payment', amount: 160000 },
  { date: '2025-06-24', name: 'pavanethira raja', details: 'Lease payment', amount: 95960 },
  { date: '2025-06-24', name: 'T.M.Naffes', details: 'Bike down payment', amount: 350000 },
  { date: '2025-06-24', name: 'R.Singaravelu', details: 'Bike down payment', amount: 182600 },
  { date: '2025-06-25', name: '', details: 'oil', amount: 2500 },
  { date: '2025-06-26', name: 'Najl', details: 'Lease payment', amount: 100000 },
  { date: '2025-06-27', name: 'T.Anthony muththu wlay', details: 'Bike payment', amount: 670000 },
  { date: '2025-06-27', name: 'S.Jeganathan', details: 'Bike down payment', amount: 200000 },
  { date: '2025-06-27', name: 'K.Thusyanthan', details: 'Bike payment', amount: 215000 },
  { date: '2025-06-27', name: 'M.M.M.Naflan', details: 'Bike payment', amount: 150000 },
  { date: '2025-06-28', name: 'S.Nerusan', details: 'Bike payment', amount: 643000 },
  { date: '2025-06-28', name: 'N.M.Jamees', details: 'bike lease payment', amount: 92000 },
  { date: '2025-06-28', name: 'Y.M.Milhan', details: 'Bike payment', amount: 275000 },
  { date: '2025-06-30', name: 'K.Vimalanayagam', details: 'bike balance payment', amount: 15960 },
  { date: '2025-06-30', name: 'Y.M.Milhan', details: 'Bike payment', amount: 25000 },
  { date: '2025-07-01', name: 'Vikneshwaran', details: 'bike balance payment', amount: 25000 },
  { date: '2025-07-02', name: 'V.M.Allahpichchai', details: 'Bike payment', amount: 639950 },
  { date: '2025-07-02', name: 'M.Mariyalurthakaran', details: 'bike balance payment', amount: 12950 },
  { date: '2025-07-02', name: 'S.Rajkumar', details: 'Bike payment', amount: 150000 },
  { date: '2025-07-03', name: 'Amalrajan', details: 'bike advence payment', amount: 20000 },
  { date: '2025-07-04', name: 'E.Dilaxshan lembert', details: 'Bike lease payment', amount: 400000 },
  { date: '2025-07-04', name: 'N.Jegatheepan', details: 'Bike down payment', amount: 300000 },
  { date: '2025-07-04', name: '', details: 'helmet', amount: 3500 },
  { date: '2025-07-06', name: 'S.M.Iqbal', details: 'Bike down payment', amount: 400000 },
  { date: '2025-07-09', name: 'T.Subaitha umma', details: 'Bike down payment', amount: 142200 },
  { date: '2025-07-05', name: '', details: 'helmet', amount: 3900 },
  { date: '2025-07-07', name: '', details: 'helmet', amount: 4250 },
  { date: '2025-07-08', name: '', details: 'oil', amount: 2500 },
  { date: '2025-07-09', name: '', details: '2 oil', amount: 5100 },
  { date: '2025-07-11', name: 'R.Mexmilijan', details: 'bike booking payment', amount: 40000 },
  { date: '2025-07-14', name: 'P.Puvannenthira raja', details: 'bike balance payment', amount: 10000 },
  { date: '2025-07-14', name: 'K.Kajakaran', details: 'bike advence payment', amount: 200000 },
  { date: '2025-07-14', name: 'N.M.Jamees', details: 'Bike payment', amount: 197000 },
  { date: '2025-07-14', name: 'K.M.Rikas', details: 'Bike down payment', amount: 212500 },
  { date: '2025-07-16', name: 'K.Kajakaran', details: 'bike advence payment', amount: 400000 },
  { date: '2025-07-16', name: 'Nitharshan', details: 'Bike down payment', amount: 375000 },
  { date: '2025-07-16', name: 'Marijohn', details: 'Bike payment', amount: 645150 },
  { date: '2025-07-16', name: 'V.Ajin', details: 'bike balance payment', amount: 4000 },
  { date: '2025-07-17', name: 'M.Amalrajan', details: 'Bike down payment', amount: 245000 },
  { date: '2025-07-19', name: 'S.Judles figurado', details: 'Balance lease amound', amount: 247950 },
  { date: '2025-07-19', name: 'P.Sathees', details: 'Bike down payment', amount: 140000 },
  { date: '2025-07-19', name: 'M.Fawaz', details: 'Bike full payment', amount: 735000 },
  { date: '2025-07-19', name: 'M.Rishan', details: 'Bike down payment', amount: 120000 },
  { date: '2025-07-21', name: 'P.Pegejurin', details: 'Bike down payment', amount: 150000 },
  { date: '2025-07-21', name: 'K.Thushyanthan', details: 'bike balance payment', amount: 30000 },
  { date: '2025-07-21', name: 'J.Prabakaran', details: 'Bike payment', amount: 1140000 },
  { date: '2025-07-21', name: 'S.Saibulla', details: 'Bike payment', amount: 1088150 },
  { date: '2025-07-22', name: 'M.Rishan', details: 'BIKE Down payment BALANCE', amount: 16000, remarks: 'sir' },
  { date: '2025-07-25', name: 'BANU', details: 'HELMET', amount: 2900, chequeReceivedDate: '2025-07-25', remarks: 'bike store=300000' },
  { date: '2025-07-25', name: 'IRUTHAJARAJ', details: 'HELMET', amount: 3800, chequeReceivedDate: '2025-07-25', remarks: 'received=173000' },
  { date: '2025-07-25', name: 'IRUTHAJARAJ', details: 'BIKE DOWN PAYMENT', amount: 300000, remarks: 'balance=127000' },
  { date: '2025-07-25', name: 'SUJEN', details: 'Bike full payment', amount: 1140000, leasing: 'ruban', credit: 10000 },
  { date: '2025-07-26', name: '', details: 'helmet balance peyment', amount: 1600 },
  { date: '2025-07-28', name: 'maxmilian', details: 'bike down payment', amount: 360000 },
  { date: '2025-07-28', name: 'Abishan', details: 'bike payment', amount: 648950 },
  { date: '2025-07-28', name: 'luxsan', details: 'bike down payment', amount: 150000 },
  { date: '2025-07-28', name: 'I.M Sakir', details: 'Bike down payment', amount: 535000 },
  { date: '2025-07-28', name: 'punithan', details: 'bike down payment', amount: 150000 },
  { date: '2025-07-28', name: 'joynilojan', details: 'bike down payment', amount: 250000 },
  { date: '2025-07-31', name: 'uthayakumar', details: 'bike down payment', amount: 205000 }
];

async function seedAccountData() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Check if data already exists
    const existingCount = await AccountData.countDocuments();
    
    if (existingCount > 0) {
      console.log(`Account data already exists with ${existingCount} records`);
      console.log('Skipping seed operation to avoid duplicates');
    } else {
      // Insert the account data
      const result = await AccountData.insertMany(accountData);
      console.log(`Successfully seeded ${result.length} account data records`);
    }

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  } catch (error) {
    console.error('Error seeding account data:', error);
    process.exit(1);
  }
}

seedAccountData(); 