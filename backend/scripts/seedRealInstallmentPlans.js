const mongoose = require('mongoose');
const dotenv = require('dotenv');
const InstallmentPlan = require('../models/InstallmentPlan');

dotenv.config({ path: './.env' });

// Generate installment IDs
function generateInstallmentId(num) {
  return `IP-${String(num).padStart(3, '0')}`;
}

const realInstallmentPlans = [
  // January
  { customerName: 'Sebasthiyan Thanusan', month: 'January' },
  { customerName: 'S.M.Hilmi', month: 'January' },
  { customerName: 'M.Siddik Ruwaisdeen', month: 'January' },
  { customerName: 'Viyan Sayanthan', month: 'January' },
  { customerName: 'Abdul Jabbar Mohemmed Haneefa', month: 'January' },
  { customerName: 'Mathadimai Jekanesan', month: 'January' },
  { customerName: 'Salaphthin Muhamad Safan', month: 'January' },
  { customerName: 'Josep Victor Pathmaraja Priyatharsan', month: 'January' },
  { customerName: 'Thuraraj Thanasekar', month: 'January' },
  { customerName: 'Pihille Gepava Dammika Thotawatta', month: 'January' },

  // February
  { customerName: 'Sapanathan Disanthan', month: 'February' },
  { customerName: 'V.Mageswaran', month: 'February' },
  { customerName: 'M. VivekanaNthan', month: 'February' },
  { customerName: 'S.M. Paseer', month: 'February' },
  { customerName: 'Mohamed ali mohamed natheem', month: 'February' },
  { customerName: 'Sivarasa Niroja', month: 'February' },
  { customerName: 'Emileyanspillai Steevanraj', month: 'February' },
  { customerName: 'A. Mithushan', month: 'February' },
  { customerName: 'Pathmanathan Suventhiran', month: 'February' },
  { customerName: 'Satheeskumar Jathursan', month: 'February' },
  { customerName: 'Navarathnam Ramesh', month: 'February' },

  // March
  { customerName: 'Manikkavasakar Muththukumar', month: 'March' },
  { customerName: 'Antony Thiruchelvam croos', month: 'March' },
  { customerName: 'Jeganathan Dabarera Juthith Jeganath', month: 'March' },
  { customerName: 'Arulappu Kulenthiran', month: 'March' },
  { customerName: 'Jamal Deen Kaleefa Umma', month: 'March' },
  { customerName: 'Abusalih Burhan', month: 'March' },
  { customerName: 'Asaneyina Mohamed Nayisar', month: 'March' },
  { customerName: 'Thomas Dinushan', month: 'March' },
  { customerName: 'Mohammend Siyavdeen mohammed Imran', month: 'March' },
  { customerName: 'Madutheen Steepa', month: 'March' },
  { customerName: 'Anthony Joseph Figurado', month: 'March' },
  { customerName: 'Ruvatheen Najemutheen', month: 'March' },
  { customerName: 'Anthony coonghe sanikilas', month: 'March' },
  { customerName: 'Habeeb Mohaed abthul Rakeem', month: 'March' },
  { customerName: 'Velan Thavarasa', month: 'March' },
  { customerName: 'John Peter Croos Thommai Croos', month: 'March' },
  { customerName: 'Alponse pavalon Francis', month: 'March' },
  { customerName: 'Anthonypillai Alosiyas Croos', month: 'March' },
  { customerName: 'Karuppaiya Ramachandran', month: 'March' },
  { customerName: 'Kirubanayakam Vimalnayakam', month: 'March' },
  { customerName: 'Mohamed Ali Mohamed Najil', month: 'March' },
  { customerName: 'Sebasthiampillai Juthakaran Keduthoor', month: 'March' },
  { customerName: 'Jeyaram Thanusilan', month: 'March' },
  { customerName: 'Nahoor Pichchai Mohamed Sajil', month: 'March' },

  // April
  { customerName: 'H.M.M.Nihar', month: 'April' },
  { customerName: 'M.H.M.Afnas', month: 'April' },
  { customerName: 'Thampi silvadasan', month: 'April' },
  { customerName: 'H.M.Ahkam', month: 'April' },
  { customerName: 'M.Thanusikan', month: 'April' },
  { customerName: 'Nikkilas Nelson', month: 'April' },
  { customerName: 'S.M.Richman', month: 'April' },
  { customerName: 'M.S.F.Farween', month: 'April' },
  { customerName: 'R.Manas', month: 'April' },
  { customerName: 'Nadarasa Kobinath', month: 'April' },
  { customerName: 'S.Nimalakeshan', month: 'April' },
  { customerName: 'Sivakumar Thanusan', month: 'April' },
  { customerName: 'A.R.A.Quman', month: 'April' },
  { customerName: 'M.J.M.Siyam', month: 'April' },
  { customerName: 'M.I.M.Baseer', month: 'April' },

  // May
  { customerName: 'Abdul Samadu Haider', month: 'May' },
  { customerName: 'K.A.Rusanth', month: 'May' },
  { customerName: 'J.S.PERERA', month: 'May' },
  { customerName: 'L.LASINTAON', month: 'May' },
  { customerName: 'S.SUVARNAN', month: 'May' },
  { customerName: 'K.Thursnakumar', month: 'May' },
  { customerName: 'S.T.KILTAN', month: 'May' },
  { customerName: 'K.M.Rilas', month: 'May' },
  { customerName: 'N.M.JAMEES', month: 'May' },
  { customerName: 'S.Susmithan', month: 'May' },
  { customerName: 'M.M.Thaseem', month: 'May' },
  { customerName: 'C.Richadly', month: 'May' },
  { customerName: 'R.Puvanenthirarara', month: 'May' },
  { customerName: 'S.Iyoobkhan', month: 'May' },
  { customerName: 'P.Vickneswaran', month: 'May' },
  { customerName: 'S.Indrakumaran', month: 'May' },
  { customerName: 'L.A.N.Khan', month: 'May' },
  { customerName: 'M.Mariyalurthakaran', month: 'May' },
  { customerName: 'P.G.D.S.Thotawaththa', month: 'May' },
  { customerName: 'T.J.Rajeevan', month: 'May' },
  { customerName: 'N.Nirojan', month: 'May' },

  // June
  { customerName: 'E.J.J.Dilaxsan lembert', month: 'June' },
  { customerName: 'M.M.M.Mahir', month: 'June' },
  { customerName: 'A.Yuvaraj kanistan', month: 'June' },
  { customerName: 'M.T.J.Ahamadu', month: 'June' },
  { customerName: 'T.Asrahali', month: 'June' },
  { customerName: 'S.Puthijavan', month: 'June' },
  { customerName: 'M.M.Irshad', month: 'June' },
  { customerName: 'A.J.JANISTAN', month: 'June' },
  { customerName: 'P.Joy printon', month: 'June' },
  { customerName: 'S.Soosainayagam', month: 'June' },
  { customerName: 'A.Jasotharan', month: 'June' },
  { customerName: 'J.Tharshakumar', month: 'June' },
  { customerName: 'K.Judejansan', month: 'June' },
  { customerName: 'S.Judles Figurado', month: 'June' },
  { customerName: 'V.Ajin', month: 'June' },
  { customerName: 'I.Singaravelu', month: 'June' },
  { customerName: 'T.M.Nafees', month: 'June' },
  { customerName: 'S.Jeganathan', month: 'June' },
  { customerName: 'T.A.Muththu culas', month: 'June' },
  { customerName: 'M.N.M.Naflan', month: 'June' },
  { customerName: 'K.Thushyanthan', month: 'June' },
  { customerName: 'S.Nerusan', month: 'June' },
  { customerName: 'Y.M.Milhan', month: 'June' },

  // July
  { customerName: 'S.Rajkumar', month: 'July' },
  { customerName: 'V.M.Hllabpichchai', month: 'July' },
  { customerName: 'A.Rojarstalin', month: 'July' },
  { customerName: 'N.Jegatheepan', month: 'July' },
  { customerName: 'T.S.Umma', month: 'July' },
  { customerName: 'S.M.Iqbal', month: 'July' }
];

async function seedRealInstallmentPlans() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Clear existing installment plans
    await InstallmentPlan.deleteMany({});
    console.log('Cleared existing installment plans');

    // Add installmentId and default values to all records
    const plansWithIds = realInstallmentPlans.map((plan, index) => ({
      ...plan,
      installmentId: generateInstallmentId(index + 1),
      totalAmount: null,
      downPayment: null,
      monthlyInstallment: null,
      numberOfMonths: null,
      startDate: null,
      endDate: null,
      remainingBalance: null,
      paymentStatus: 'Active',
      vehicleModel: '',
      phoneNumber: '',
      email: '',
      address: '',
      notes: ''
    }));

    // Insert new installment plans
    const installmentPlans = await InstallmentPlan.insertMany(plansWithIds);
    console.log(`Successfully seeded ${installmentPlans.length} real installment plans`);

    // Display summary
    const stats = await InstallmentPlan.aggregate([
      {
        $group: {
          _id: '$month',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    console.log('\nReal Installment Plans Summary by Month:');
    stats.forEach(stat => {
      console.log(`${stat._id}: ${stat.count} plans`);
    });

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  } catch (error) {
    console.error('Error seeding real installment plans:', error);
    process.exit(1);
  }
}

seedRealInstallmentPlans(); 