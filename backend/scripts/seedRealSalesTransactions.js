const mongoose = require('mongoose');
const dotenv = require('dotenv');
const SalesTransaction = require('../models/SalesTransaction');

dotenv.config({ path: './.env' });

// Generate invoice numbers
function generateInvoiceNo(num) {
  return `INV-${String(num).padStart(4, '0')}`;
}

const realSalesTransactions = [
  // January
  { customerName: 'Sebasthiyan Thanusan', salesDate: '2025-01-06' },
  { customerName: 'S.M.Hilmi', salesDate: '2025-01-06' },
  { customerName: 'M.Siddik Ruwaisdeen', salesDate: '2025-01-09' },
  { customerName: 'Viyan Sayanthan', salesDate: '2025-01-09' },
  { customerName: 'Abdul Jabbar Mohemmed Haneefa', salesDate: '2025-01-10' },
  { customerName: 'Mathadimai Jekanesan', salesDate: '2025-01-11' },
  { customerName: 'Salaphthin Muhamad Safan', salesDate: '2025-01-13' },
  { customerName: 'Josep Victor Pathmaraja Priyatharsan', salesDate: '2025-01-18' },
  { customerName: 'Thuraraj Thanasekar', salesDate: '2025-01-25' },
  { customerName: 'Pihille Gepava Dammika Thotawatta', salesDate: '2025-01-31' },

  // February
  { customerName: 'Sapanathan Disanthan', salesDate: '2025-02-08' },
  { customerName: 'V.Mageswaran', salesDate: '2025-02-12' },
  { customerName: 'M. VivekanaNthan', salesDate: '2025-02-07' },
  { customerName: 'S.M. Paseer', salesDate: '2025-02-14' },
  { customerName: 'Mohamed ali mohamed natheem', salesDate: '2025-02-21' },
  { customerName: 'Sivarasa Niroja', salesDate: '2025-02-20' },
  { customerName: 'Emileyanspillai Steevanraj', salesDate: '2025-02-21' },
  { customerName: 'A. Mithushan', salesDate: '2025-02-19' },
  { customerName: 'Pathmanathan Suventhiran', salesDate: '2025-02-18' },
  { customerName: 'Satheeskumar Jathursan', salesDate: '2025-02-18' },
  { customerName: 'Navarathnam Ramesh', salesDate: '2025-02-07' },

  // March
  { customerName: 'Manikkavasakar Muththukumar', salesDate: '2025-03-01' },
  { customerName: 'Antony Thiruchelvam croos', salesDate: '2025-03-03' },
  { customerName: 'Jeganathan Dabarera Juthith Jeganath', salesDate: '2025-03-05' },
  { customerName: 'Arulappu Kulenthiran', salesDate: '2025-03-06' },
  { customerName: 'Jamal Deen Kaleefa Umma', salesDate: '2025-03-07' },
  { customerName: 'Abusalih Burhan', salesDate: '2025-03-08' },
  { customerName: 'Asaneyina Mohamed Nayisar', salesDate: '2025-03-08' },
  { customerName: 'Thomas Dinushan', salesDate: '2025-03-11' },
  { customerName: 'Mohammend Siyavdeen mohammed Imran', salesDate: '2025-03-14' },
  { customerName: 'Madutheen Steepa', salesDate: '2025-03-14' },
  { customerName: 'Anthony Joseph Figurado', salesDate: '2025-03-17' },
  { customerName: 'Ruvatheen Najemutheen', salesDate: '2025-03-17' },
  { customerName: 'Anthony coonghe sanikilas', salesDate: '2025-03-18' },
  { customerName: 'Habeeb Mohaed abthul Rakeem', salesDate: '2025-03-20' },
  { customerName: 'Velan Thavarasa', salesDate: '2025-03-24' },
  { customerName: 'John Peter Croos Thommai Croos', salesDate: '2025-03-24' },
  { customerName: 'Alponse pavalon Francis', salesDate: '2025-03-24' },
  { customerName: 'Anthonypillai Alosiyas Croos', salesDate: '2025-03-25' },
  { customerName: 'Karuppaiya Ramachandran', salesDate: '2025-03-26' },
  { customerName: 'Kirubanayakam Vimalnayakam', salesDate: '2025-03-27' },
  { customerName: 'Mohamed Ali Mohamed Najil', salesDate: '2025-03-31' },
  { customerName: 'Sebasthiampillai Juthakaran Keduthoor', salesDate: '2025-03-31' },
  { customerName: 'Jeyaram Thanusilan', salesDate: '2025-03-31' },
  { customerName: 'Nahoor Pichchai Mohamed Sajil', salesDate: '2025-03-31' },

  // April
  { customerName: 'H.M.M.Nihar', salesDate: '2025-04-01' },
  { customerName: 'M.H.M.Afnas', salesDate: '2025-04-09' },
  { customerName: 'Thampi silvadasan', salesDate: '2025-04-10' },
  { customerName: 'H.M.Ahkam', salesDate: '2025-04-11' },
  { customerName: 'M.Thanusikan', salesDate: '2025-04-16' },
  { customerName: 'Nikkilas Nelson', salesDate: '2025-04-21' },
  { customerName: 'S.M.Richman', salesDate: '2025-04-21' },
  { customerName: 'M.S.F.Farween', salesDate: '2025-04-24' },
  { customerName: 'R.Manas', salesDate: '2025-04-24' },
  { customerName: 'Nadarasa Kobinath', salesDate: '2025-04-25' },
  { customerName: 'S.Nimalakeshan', salesDate: '2025-04-25' },
  { customerName: 'Sivakumar Thanusan', salesDate: '2025-04-28' },
  { customerName: 'A.R.A.Quman', salesDate: '2025-04-29' },
  { customerName: 'M.J.M.Siyam', salesDate: '2025-04-29' },
  { customerName: 'M.I.M.Baseer', salesDate: '2025-04-30' },

  // May
  { customerName: 'Abdul Samadu Haider', salesDate: '2025-05-03' },
  { customerName: 'K.A.Rusanth', salesDate: '2025-05-15' },
  { customerName: 'J.S.PERERA', salesDate: '2025-05-15' },
  { customerName: 'L.LASINTAON', salesDate: '2025-05-15' },
  { customerName: 'S.SUVARNAN', salesDate: '2025-05-15' },
  { customerName: 'K.Thursnakumar', salesDate: '2025-05-15' },
  { customerName: 'S.T.KILTAN', salesDate: '2025-05-16' },
  { customerName: 'K.M.Rilas', salesDate: '2025-05-19' },
  { customerName: 'N.M.JAMEES', salesDate: '2025-05-19' },
  { customerName: 'S.Susmithan', salesDate: '2025-05-19' },
  { customerName: 'M.M.Thaseem', salesDate: '2025-05-20' },
  { customerName: 'C.Richadly', salesDate: '2025-05-20' },
  { customerName: 'R.Puvanenthirarara', salesDate: '2025-05-22' },
  { customerName: 'S.Iyoobkhan', salesDate: '2025-05-22' },
  { customerName: 'P.Vickneswaran', salesDate: '2025-05-22' },
  { customerName: 'S.Indrakumaran', salesDate: '2025-05-23' },
  { customerName: 'L.A.N.Khan', salesDate: '2025-05-27' },
  { customerName: 'M.Mariyalurthakaran', salesDate: '2025-05-31' },
  { customerName: 'P.G.D.S.Thotawaththa', salesDate: '2025-05-31' },
  { customerName: 'T.J.Rajeevan', salesDate: '2025-05-31' },
  { customerName: 'N.Nirojan', salesDate: '2025-05-31' },

  // June
  { customerName: 'E.J.J.Dilaxsan lembert', salesDate: '2025-06-02' },
  { customerName: 'M.M.M.Mahir', salesDate: '2025-06-02' },
  { customerName: 'A.Yuvaraj kanistan', salesDate: '2025-06-02' },
  { customerName: 'M.T.J.Ahamadu', salesDate: '2025-06-03' },
  { customerName: 'T.Asrahali', salesDate: '2025-06-03' },
  { customerName: 'S.Puthijavan', salesDate: '2025-06-06' },
  { customerName: 'M.M.Irshad', salesDate: '2025-06-10' },
  { customerName: 'A.J.JANISTAN', salesDate: '2025-06-11' },
  { customerName: 'P.Joy printon', salesDate: '2025-06-17' },
  { customerName: 'S.Soosainayagam', salesDate: '2025-06-20' },
  { customerName: 'A.Jasotharan', salesDate: '2025-06-20' },
  { customerName: 'J.Tharshakumar', salesDate: '2025-06-20' },
  { customerName: 'K.Judejansan', salesDate: '2025-06-21' },
  { customerName: 'S.Judles Figurado', salesDate: '2025-06-21' },
  { customerName: 'V.Ajin', salesDate: '2025-06-24' },
  { customerName: 'I.Singaravelu', salesDate: '2025-06-24' },
  { customerName: 'T.M.Nafees', salesDate: '2025-06-24' },
  { customerName: 'S.Jeganathan', salesDate: '2025-06-27' },
  { customerName: 'T.A.Muththu culas', salesDate: '2025-06-27' },
  { customerName: 'M.N.M.Naflan', salesDate: '2025-06-27' },
  { customerName: 'K.Thushyanthan', salesDate: '2025-06-27' },
  { customerName: 'S.Nerusan', salesDate: '2025-06-28' },
  { customerName: 'Y.M.Milhan', salesDate: '2025-06-28' },

  // July
  { customerName: 'S.Rajkumar', salesDate: '2025-07-02' },
  { customerName: 'V.M.Hllabpichchai', salesDate: '2025-07-02' },
  { customerName: 'A.Rojarstalin', salesDate: '2025-07-04' },
  { customerName: 'N.Jegatheepan', salesDate: '2025-07-04' },
  { customerName: 'T.S.Umma', salesDate: '2025-07-09' },
  { customerName: 'S.M.Iqbal', salesDate: '2025-07-05' }
];

async function seedRealSalesTransactions() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Clear existing sales transactions
    await SalesTransaction.deleteMany({});
    console.log('Cleared existing sales transactions');

    // Add invoice numbers and default values to all records
    const transactionsWithIds = realSalesTransactions.map((transaction, index) => ({
      ...transaction,
      invoiceNo: generateInvoiceNo(index + 1),
      bikeId: '',
      salespersonName: '',
      sellingPrice: null,
      discountApplied: null,
      finalAmount: null,
      paymentMethod: '',
      paymentStatus: '',
      warrantyPeriod: '',
      freeServiceDetails: ''
    }));

    // Insert new sales transactions
    const salesTransactions = await SalesTransaction.insertMany(transactionsWithIds);
    console.log(`Successfully seeded ${salesTransactions.length} real sales transactions`);

    // Display summary by month
    const stats = await SalesTransaction.aggregate([
      {
        $group: {
          _id: { $substr: ['$salesDate', 5, 2] },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    console.log('\nReal Sales Transactions Summary by Month:');
    const monthNames = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    stats.forEach(stat => {
      const monthNum = parseInt(stat._id);
      console.log(`${monthNames[monthNum]}: ${stat.count} transactions`);
    });

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  } catch (error) {
    console.error('Error seeding real sales transactions:', error);
    process.exit(1);
  }
}

seedRealSalesTransactions(); 