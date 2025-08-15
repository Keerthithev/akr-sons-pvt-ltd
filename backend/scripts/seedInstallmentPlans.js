const mongoose = require('mongoose');
const dotenv = require('dotenv');
const InstallmentPlan = require('../models/InstallmentPlan');

dotenv.config({ path: './.env' });

// Generate installment IDs
function generateInstallmentId(num) {
  return `IP-${String(num).padStart(3, '0')}`;
}

const sampleInstallmentPlans = [
  // February
  { customerName: 'Sebasthiyan Thanusan', month: 'February', totalAmount: 450000, downPayment: 50000, monthlyInstallment: 25000, numberOfMonths: 16, startDate: '2024-02-01', endDate: '2025-06-01', remainingBalance: 400000, paymentStatus: 'Active' },
  { customerName: 'S.M.Hilmi', month: 'February', totalAmount: 380000, downPayment: 40000, monthlyInstallment: 20000, numberOfMonths: 17, startDate: '2024-02-05', endDate: '2025-07-05', remainingBalance: 340000, paymentStatus: 'Active' },
  { customerName: 'M.Siddik Ruwaisdeen', month: 'February', totalAmount: 520000, downPayment: 60000, monthlyInstallment: 30000, numberOfMonths: 15, startDate: '2024-02-10', endDate: '2025-05-10', remainingBalance: 460000, paymentStatus: 'Active' },
  { customerName: 'Viyan Sayanthan', month: 'February', totalAmount: 420000, downPayment: 45000, monthlyInstallment: 22000, numberOfMonths: 17, startDate: '2024-02-15', endDate: '2025-07-15', remainingBalance: 375000, paymentStatus: 'Active' },
  { customerName: 'Abdul Jabbar Mohemmed Haneefa', month: 'February', totalAmount: 480000, downPayment: 55000, monthlyInstallment: 28000, numberOfMonths: 15, startDate: '2024-02-20', endDate: '2025-05-20', remainingBalance: 425000, paymentStatus: 'Active' },
  { customerName: 'Mathadimai Jekanesan', month: 'February', totalAmount: 350000, downPayment: 35000, monthlyInstallment: 18000, numberOfMonths: 17, startDate: '2024-02-25', endDate: '2025-07-25', remainingBalance: 315000, paymentStatus: 'Active' },
  { customerName: 'Salaphthin Muhamad Safan', month: 'February', totalAmount: 410000, downPayment: 42000, monthlyInstallment: 21000, numberOfMonths: 17, startDate: '2024-02-28', endDate: '2025-07-28', remainingBalance: 368000, paymentStatus: 'Active' },
  { customerName: 'Josep Victor Pathmaraja Priyatharsan', month: 'February', totalAmount: 460000, downPayment: 50000, monthlyInstallment: 24000, numberOfMonths: 17, startDate: '2024-02-29', endDate: '2025-07-29', remainingBalance: 410000, paymentStatus: 'Active' },
  { customerName: 'Thuraraj Thanasekar', month: 'February', totalAmount: 390000, downPayment: 40000, monthlyInstallment: 20000, numberOfMonths: 17, startDate: '2024-02-30', endDate: '2025-07-30', remainingBalance: 350000, paymentStatus: 'Active' },
  { customerName: 'Pihille Gepava Dammika Thotawatta', month: 'February', totalAmount: 440000, downPayment: 48000, monthlyInstallment: 23000, numberOfMonths: 17, startDate: '2024-02-31', endDate: '2025-07-31', remainingBalance: 392000, paymentStatus: 'Active' },

  // March
  { customerName: 'Sapanathan Disanthan', month: 'March', totalAmount: 470000, downPayment: 52000, monthlyInstallment: 26000, numberOfMonths: 16, startDate: '2024-03-01', endDate: '2025-07-01', remainingBalance: 418000, paymentStatus: 'Active' },
  { customerName: 'V.Mageswaran', month: 'March', totalAmount: 360000, downPayment: 38000, monthlyInstallment: 19000, numberOfMonths: 17, startDate: '2024-03-05', endDate: '2025-08-05', remainingBalance: 322000, paymentStatus: 'Active' },
  { customerName: 'M. VivekanaNthan', month: 'March', totalAmount: 430000, downPayment: 46000, monthlyInstallment: 22000, numberOfMonths: 17, startDate: '2024-03-10', endDate: '2025-08-10', remainingBalance: 384000, paymentStatus: 'Active' },
  { customerName: 'S.M. Paseer', month: 'March', totalAmount: 500000, downPayment: 58000, monthlyInstallment: 29000, numberOfMonths: 15, startDate: '2024-03-15', endDate: '2025-06-15', remainingBalance: 442000, paymentStatus: 'Active' },
  { customerName: 'Mohamed ali mohamed natheem', month: 'March', totalAmount: 380000, downPayment: 40000, monthlyInstallment: 20000, numberOfMonths: 17, startDate: '2024-03-20', endDate: '2025-08-20', remainingBalance: 340000, paymentStatus: 'Active' },
  { customerName: 'Sivarasa Niroja', month: 'March', totalAmount: 420000, downPayment: 45000, monthlyInstallment: 22000, numberOfMonths: 17, startDate: '2024-03-25', endDate: '2025-08-25', remainingBalance: 375000, paymentStatus: 'Active' },
  { customerName: 'Emileyanspillai Steevanraj', month: 'March', totalAmount: 450000, downPayment: 50000, monthlyInstallment: 25000, numberOfMonths: 16, startDate: '2024-03-30', endDate: '2025-07-30', remainingBalance: 400000, paymentStatus: 'Active' },
  { customerName: 'A. Mithushan', month: 'March', totalAmount: 390000, downPayment: 42000, monthlyInstallment: 21000, numberOfMonths: 17, startDate: '2024-03-31', endDate: '2025-08-31', remainingBalance: 348000, paymentStatus: 'Active' },
  { customerName: 'Pathmanathan Suventhiran', month: 'March', totalAmount: 460000, downPayment: 52000, monthlyInstallment: 26000, numberOfMonths: 16, startDate: '2024-03-31', endDate: '2025-07-31', remainingBalance: 408000, paymentStatus: 'Active' },
  { customerName: 'Satheeskumar Jathursan', month: 'March', totalAmount: 410000, downPayment: 44000, monthlyInstallment: 22000, numberOfMonths: 17, startDate: '2024-03-31', endDate: '2025-08-31', remainingBalance: 366000, paymentStatus: 'Active' },
  { customerName: 'Navarathnam Ramesh', month: 'March', totalAmount: 480000, downPayment: 55000, monthlyInstallment: 28000, numberOfMonths: 15, startDate: '2024-03-31', endDate: '2025-06-30', remainingBalance: 425000, paymentStatus: 'Active' },

  // April
  { customerName: 'Manikkavasakar Muththukumar', month: 'April', totalAmount: 440000, downPayment: 48000, monthlyInstallment: 24000, numberOfMonths: 16, startDate: '2024-04-01', endDate: '2025-08-01', remainingBalance: 392000, paymentStatus: 'Active' },
  { customerName: 'Antony Thiruchelvam croos', month: 'April', totalAmount: 520000, downPayment: 60000, monthlyInstallment: 30000, numberOfMonths: 15, startDate: '2024-04-05', endDate: '2025-07-05', remainingBalance: 460000, paymentStatus: 'Active' },
  { customerName: 'Jeganathan Dabarera Juthith Jeganath', month: 'April', totalAmount: 380000, downPayment: 40000, monthlyInstallment: 20000, numberOfMonths: 17, startDate: '2024-04-10', endDate: '2025-09-10', remainingBalance: 340000, paymentStatus: 'Active' },
  { customerName: 'Arulappu Kulenthiran', month: 'April', totalAmount: 460000, downPayment: 52000, monthlyInstallment: 26000, numberOfMonths: 16, startDate: '2024-04-15', endDate: '2025-08-15', remainingBalance: 408000, paymentStatus: 'Active' },
  { customerName: 'Jamal Deen Kaleefa Umma', month: 'April', totalAmount: 420000, downPayment: 45000, monthlyInstallment: 22000, numberOfMonths: 17, startDate: '2024-04-20', endDate: '2025-09-20', remainingBalance: 375000, paymentStatus: 'Active' },
  { customerName: 'Abusalih Burhan', month: 'April', totalAmount: 500000, downPayment: 58000, monthlyInstallment: 29000, numberOfMonths: 15, startDate: '2024-04-25', endDate: '2025-07-25', remainingBalance: 442000, paymentStatus: 'Active' },
  { customerName: 'Asaneyina Mohamed Nayisar', month: 'April', totalAmount: 360000, downPayment: 38000, monthlyInstallment: 19000, numberOfMonths: 17, startDate: '2024-04-30', endDate: '2025-09-30', remainingBalance: 322000, paymentStatus: 'Active' },
  { customerName: 'Thomas Dinushan', month: 'April', totalAmount: 480000, downPayment: 55000, monthlyInstallment: 28000, numberOfMonths: 15, startDate: '2024-04-30', endDate: '2025-07-30', remainingBalance: 425000, paymentStatus: 'Active' },
  { customerName: 'Mohammend Siyavdeen mohammed Imran', month: 'April', totalAmount: 410000, downPayment: 44000, monthlyInstallment: 22000, numberOfMonths: 17, startDate: '2024-04-30', endDate: '2025-09-30', remainingBalance: 366000, paymentStatus: 'Active' },
  { customerName: 'Madutheen Steepa', month: 'April', totalAmount: 450000, downPayment: 50000, monthlyInstallment: 25000, numberOfMonths: 16, startDate: '2024-04-30', endDate: '2025-08-30', remainingBalance: 400000, paymentStatus: 'Active' },
  { customerName: 'Anthony Joseph Figurado', month: 'April', totalAmount: 390000, downPayment: 42000, monthlyInstallment: 21000, numberOfMonths: 17, startDate: '2024-04-30', endDate: '2025-09-30', remainingBalance: 348000, paymentStatus: 'Active' },
  { customerName: 'Ruvatheen Najemutheen', month: 'April', totalAmount: 470000, downPayment: 54000, monthlyInstallment: 27000, numberOfMonths: 15, startDate: '2024-04-30', endDate: '2025-07-30', remainingBalance: 416000, paymentStatus: 'Active' },
  { customerName: 'Anthony coonghe sanikilas', month: 'April', totalAmount: 430000, downPayment: 47000, monthlyInstallment: 23000, numberOfMonths: 17, startDate: '2024-04-30', endDate: '2025-09-30', remainingBalance: 383000, paymentStatus: 'Active' },
  { customerName: 'Habeeb Mohaed abthul Rakeem', month: 'April', totalAmount: 380000, downPayment: 40000, monthlyInstallment: 20000, numberOfMonths: 17, startDate: '2024-04-30', endDate: '2025-09-30', remainingBalance: 340000, paymentStatus: 'Active' },
  { customerName: 'Velan Thavarasa', month: 'April', totalAmount: 460000, downPayment: 52000, monthlyInstallment: 26000, numberOfMonths: 16, startDate: '2024-04-30', endDate: '2025-08-30', remainingBalance: 408000, paymentStatus: 'Active' },
  { customerName: 'John Peter Croos Thommai Croos', month: 'April', totalAmount: 420000, downPayment: 45000, monthlyInstallment: 22000, numberOfMonths: 17, startDate: '2024-04-30', endDate: '2025-09-30', remainingBalance: 375000, paymentStatus: 'Active' },
  { customerName: 'Alponse pavalon Francis', month: 'April', totalAmount: 500000, downPayment: 58000, monthlyInstallment: 29000, numberOfMonths: 15, startDate: '2024-04-30', endDate: '2025-07-30', remainingBalance: 442000, paymentStatus: 'Active' },
  { customerName: 'Anthonypillai Alosiyas Croos', month: 'April', totalAmount: 360000, downPayment: 38000, monthlyInstallment: 19000, numberOfMonths: 17, startDate: '2024-04-30', endDate: '2025-09-30', remainingBalance: 322000, paymentStatus: 'Active' },
  { customerName: 'Karuppaiya Ramachandran', month: 'April', totalAmount: 480000, downPayment: 55000, monthlyInstallment: 28000, numberOfMonths: 15, startDate: '2024-04-30', endDate: '2025-07-30', remainingBalance: 425000, paymentStatus: 'Active' },
  { customerName: 'Kirubanayakam Vimalnayakam', month: 'April', totalAmount: 410000, downPayment: 44000, monthlyInstallment: 22000, numberOfMonths: 17, startDate: '2024-04-30', endDate: '2025-09-30', remainingBalance: 366000, paymentStatus: 'Active' },
  { customerName: 'Mohamed Ali Mohamed Najil', month: 'April', totalAmount: 450000, downPayment: 50000, monthlyInstallment: 25000, numberOfMonths: 16, startDate: '2024-04-30', endDate: '2025-08-30', remainingBalance: 400000, paymentStatus: 'Active' },
  { customerName: 'Sebasthiampillai Juthakaran Keduthoor', month: 'April', totalAmount: 390000, downPayment: 42000, monthlyInstallment: 21000, numberOfMonths: 17, startDate: '2024-04-30', endDate: '2025-09-30', remainingBalance: 348000, paymentStatus: 'Active' },
  { customerName: 'Jeyaram Thanusilan', month: 'April', totalAmount: 470000, downPayment: 54000, monthlyInstallment: 27000, numberOfMonths: 15, startDate: '2024-04-30', endDate: '2025-07-30', remainingBalance: 416000, paymentStatus: 'Active' },
  { customerName: 'Nahoor Pichchai Mohamed Sajil', month: 'April', totalAmount: 430000, downPayment: 47000, monthlyInstallment: 23000, numberOfMonths: 17, startDate: '2024-04-30', endDate: '2025-09-30', remainingBalance: 383000, paymentStatus: 'Active' },

  // May
  { customerName: 'H.M.M.Nihar', month: 'May', totalAmount: 440000, downPayment: 48000, monthlyInstallment: 24000, numberOfMonths: 16, startDate: '2024-05-01', endDate: '2025-09-01', remainingBalance: 392000, paymentStatus: 'Active' },
  { customerName: 'M.H.M.Afnas', month: 'May', totalAmount: 520000, downPayment: 60000, monthlyInstallment: 30000, numberOfMonths: 15, startDate: '2024-05-05', endDate: '2025-08-05', remainingBalance: 460000, paymentStatus: 'Active' },
  { customerName: 'Thampi silvadasan', month: 'May', totalAmount: 380000, downPayment: 40000, monthlyInstallment: 20000, numberOfMonths: 17, startDate: '2024-05-10', endDate: '2025-10-10', remainingBalance: 340000, paymentStatus: 'Active' },
  { customerName: 'H.M.Ahkam', month: 'May', totalAmount: 460000, downPayment: 52000, monthlyInstallment: 26000, numberOfMonths: 16, startDate: '2024-05-15', endDate: '2025-09-15', remainingBalance: 408000, paymentStatus: 'Active' },
  { customerName: 'M.Thanusikan', month: 'May', totalAmount: 420000, downPayment: 45000, monthlyInstallment: 22000, numberOfMonths: 17, startDate: '2024-05-20', endDate: '2025-10-20', remainingBalance: 375000, paymentStatus: 'Active' },
  { customerName: 'Nikkilas Nelson', month: 'May', totalAmount: 500000, downPayment: 58000, monthlyInstallment: 29000, numberOfMonths: 15, startDate: '2024-05-25', endDate: '2025-08-25', remainingBalance: 442000, paymentStatus: 'Active' },
  { customerName: 'S.M.Richman', month: 'May', totalAmount: 360000, downPayment: 38000, monthlyInstallment: 19000, numberOfMonths: 17, startDate: '2024-05-30', endDate: '2025-10-30', remainingBalance: 322000, paymentStatus: 'Active' },
  { customerName: 'M.S.F.Farween', month: 'May', totalAmount: 480000, downPayment: 55000, monthlyInstallment: 28000, numberOfMonths: 15, startDate: '2024-05-31', endDate: '2025-08-31', remainingBalance: 425000, paymentStatus: 'Active' },
  { customerName: 'R.Manas', month: 'May', totalAmount: 410000, downPayment: 44000, monthlyInstallment: 22000, numberOfMonths: 17, startDate: '2024-05-31', endDate: '2025-10-31', remainingBalance: 366000, paymentStatus: 'Active' },
  { customerName: 'Nadarasa Kobinath', month: 'May', totalAmount: 450000, downPayment: 50000, monthlyInstallment: 25000, numberOfMonths: 16, startDate: '2024-05-31', endDate: '2025-09-30', remainingBalance: 400000, paymentStatus: 'Active' },
  { customerName: 'S.Nimalakeshan', month: 'May', totalAmount: 390000, downPayment: 42000, monthlyInstallment: 21000, numberOfMonths: 17, startDate: '2024-05-31', endDate: '2025-10-31', remainingBalance: 348000, paymentStatus: 'Active' },
  { customerName: 'Sivakumar Thanusan', month: 'May', totalAmount: 470000, downPayment: 54000, monthlyInstallment: 27000, numberOfMonths: 15, startDate: '2024-05-31', endDate: '2025-08-31', remainingBalance: 416000, paymentStatus: 'Active' },
  { customerName: 'A.R.A.Quman', month: 'May', totalAmount: 430000, downPayment: 47000, monthlyInstallment: 23000, numberOfMonths: 17, startDate: '2024-05-31', endDate: '2025-10-31', remainingBalance: 383000, paymentStatus: 'Active' },
  { customerName: 'M.J.M.Siyam', month: 'May', totalAmount: 380000, downPayment: 40000, monthlyInstallment: 20000, numberOfMonths: 17, startDate: '2024-05-31', endDate: '2025-10-31', remainingBalance: 340000, paymentStatus: 'Active' },
  { customerName: 'M.I.M.Baseer', month: 'May', totalAmount: 460000, downPayment: 52000, monthlyInstallment: 26000, numberOfMonths: 16, startDate: '2024-05-31', endDate: '2025-09-30', remainingBalance: 408000, paymentStatus: 'Active' },

  // June
  { customerName: 'Abdul Samadu Haider', month: 'June', totalAmount: 420000, downPayment: 45000, monthlyInstallment: 22000, numberOfMonths: 17, startDate: '2024-06-01', endDate: '2025-11-01', remainingBalance: 375000, paymentStatus: 'Active' },
  { customerName: 'K.A.Rusanth', month: 'June', totalAmount: 500000, downPayment: 58000, monthlyInstallment: 29000, numberOfMonths: 15, startDate: '2024-06-05', endDate: '2025-09-05', remainingBalance: 442000, paymentStatus: 'Active' },
  { customerName: 'J.S.PERERA', month: 'June', totalAmount: 360000, downPayment: 38000, monthlyInstallment: 19000, numberOfMonths: 17, startDate: '2024-06-10', endDate: '2025-11-10', remainingBalance: 322000, paymentStatus: 'Active' },
  { customerName: 'L.LASINTAON', month: 'June', totalAmount: 480000, downPayment: 55000, monthlyInstallment: 28000, numberOfMonths: 15, startDate: '2024-06-15', endDate: '2025-09-15', remainingBalance: 425000, paymentStatus: 'Active' },
  { customerName: 'S.SUVARNAN', month: 'June', totalAmount: 410000, downPayment: 44000, monthlyInstallment: 22000, numberOfMonths: 17, startDate: '2024-06-20', endDate: '2025-11-20', remainingBalance: 366000, paymentStatus: 'Active' },
  { customerName: 'K.Thursnakumar', month: 'June', totalAmount: 450000, downPayment: 50000, monthlyInstallment: 25000, numberOfMonths: 16, startDate: '2024-06-25', endDate: '2025-10-25', remainingBalance: 400000, paymentStatus: 'Active' },
  { customerName: 'S.T.KILTAN', month: 'June', totalAmount: 390000, downPayment: 42000, monthlyInstallment: 21000, numberOfMonths: 17, startDate: '2024-06-30', endDate: '2025-11-30', remainingBalance: 348000, paymentStatus: 'Active' },
  { customerName: 'K.M.Rilas', month: 'June', totalAmount: 470000, downPayment: 54000, monthlyInstallment: 27000, numberOfMonths: 15, startDate: '2024-06-30', endDate: '2025-09-30', remainingBalance: 416000, paymentStatus: 'Active' },
  { customerName: 'N.M.JAMEES', month: 'June', totalAmount: 430000, downPayment: 47000, monthlyInstallment: 23000, numberOfMonths: 17, startDate: '2024-06-30', endDate: '2025-11-30', remainingBalance: 383000, paymentStatus: 'Active' },
  { customerName: 'S.Susmithan', month: 'June', totalAmount: 380000, downPayment: 40000, monthlyInstallment: 20000, numberOfMonths: 17, startDate: '2024-06-30', endDate: '2025-11-30', remainingBalance: 340000, paymentStatus: 'Active' },
  { customerName: 'M.M.Thaseem', month: 'June', totalAmount: 460000, downPayment: 52000, monthlyInstallment: 26000, numberOfMonths: 16, startDate: '2024-06-30', endDate: '2025-10-30', remainingBalance: 408000, paymentStatus: 'Active' },
  { customerName: 'C.Richadly', month: 'June', totalAmount: 420000, downPayment: 45000, monthlyInstallment: 22000, numberOfMonths: 17, startDate: '2024-06-30', endDate: '2025-11-30', remainingBalance: 375000, paymentStatus: 'Active' },
  { customerName: 'R.Puvanenthirarara', month: 'June', totalAmount: 500000, downPayment: 58000, monthlyInstallment: 29000, numberOfMonths: 15, startDate: '2024-06-30', endDate: '2025-09-30', remainingBalance: 442000, paymentStatus: 'Active' },
  { customerName: 'S.Iyoobkhan', month: 'June', totalAmount: 360000, downPayment: 38000, monthlyInstallment: 19000, numberOfMonths: 17, startDate: '2024-06-30', endDate: '2025-11-30', remainingBalance: 322000, paymentStatus: 'Active' },
  { customerName: 'P.Vickneswaran', month: 'June', totalAmount: 480000, downPayment: 55000, monthlyInstallment: 28000, numberOfMonths: 15, startDate: '2024-06-30', endDate: '2025-09-30', remainingBalance: 425000, paymentStatus: 'Active' },
  { customerName: 'S.Indrakumaran', month: 'June', totalAmount: 410000, downPayment: 44000, monthlyInstallment: 22000, numberOfMonths: 17, startDate: '2024-06-30', endDate: '2025-11-30', remainingBalance: 366000, paymentStatus: 'Active' },
  { customerName: 'L.A.N.Khan', month: 'June', totalAmount: 450000, downPayment: 50000, monthlyInstallment: 25000, numberOfMonths: 16, startDate: '2024-06-30', endDate: '2025-10-30', remainingBalance: 400000, paymentStatus: 'Active' },
  { customerName: 'M.Mariyalurthakaran', month: 'June', totalAmount: 390000, downPayment: 42000, monthlyInstallment: 21000, numberOfMonths: 17, startDate: '2024-06-30', endDate: '2025-11-30', remainingBalance: 348000, paymentStatus: 'Active' },
  { customerName: 'P.G.D.S.Thotawaththa', month: 'June', totalAmount: 470000, downPayment: 54000, monthlyInstallment: 27000, numberOfMonths: 15, startDate: '2024-06-30', endDate: '2025-09-30', remainingBalance: 416000, paymentStatus: 'Active' },
  { customerName: 'T.J.Rajeevan', month: 'June', totalAmount: 430000, downPayment: 47000, monthlyInstallment: 23000, numberOfMonths: 17, startDate: '2024-06-30', endDate: '2025-11-30', remainingBalance: 383000, paymentStatus: 'Active' },
  { customerName: 'N.Nirojan', month: 'June', totalAmount: 380000, downPayment: 40000, monthlyInstallment: 20000, numberOfMonths: 17, startDate: '2024-06-30', endDate: '2025-11-30', remainingBalance: 340000, paymentStatus: 'Active' },

  // July
  { customerName: 'E.J.J.Dilaxsan lembert', month: 'July', totalAmount: 460000, downPayment: 52000, monthlyInstallment: 26000, numberOfMonths: 16, startDate: '2024-07-01', endDate: '2025-11-01', remainingBalance: 408000, paymentStatus: 'Active' },
  { customerName: 'M.M.M.Mahir', month: 'July', totalAmount: 420000, downPayment: 45000, monthlyInstallment: 22000, numberOfMonths: 17, startDate: '2024-07-05', endDate: '2025-12-05', remainingBalance: 375000, paymentStatus: 'Active' },
  { customerName: 'A.Yuvaraj kanistan', month: 'July', totalAmount: 500000, downPayment: 58000, monthlyInstallment: 29000, numberOfMonths: 15, startDate: '2024-07-10', endDate: '2025-10-10', remainingBalance: 442000, paymentStatus: 'Active' },
  { customerName: 'M.T.J.Ahamadu', month: 'July', totalAmount: 360000, downPayment: 38000, monthlyInstallment: 19000, numberOfMonths: 17, startDate: '2024-07-15', endDate: '2025-12-15', remainingBalance: 322000, paymentStatus: 'Active' },
  { customerName: 'T.Asrahali', month: 'July', totalAmount: 480000, downPayment: 55000, monthlyInstallment: 28000, numberOfMonths: 15, startDate: '2024-07-20', endDate: '2025-10-20', remainingBalance: 425000, paymentStatus: 'Active' },
  { customerName: 'S.Puthijavan', month: 'July', totalAmount: 410000, downPayment: 44000, monthlyInstallment: 22000, numberOfMonths: 17, startDate: '2024-07-25', endDate: '2025-12-25', remainingBalance: 366000, paymentStatus: 'Active' },
  { customerName: 'M.M.Irshad', month: 'July', totalAmount: 450000, downPayment: 50000, monthlyInstallment: 25000, numberOfMonths: 16, startDate: '2024-07-30', endDate: '2025-11-30', remainingBalance: 400000, paymentStatus: 'Active' },
  { customerName: 'A.J.JANISTAN', month: 'July', totalAmount: 390000, downPayment: 42000, monthlyInstallment: 21000, numberOfMonths: 17, startDate: '2024-07-31', endDate: '2025-12-31', remainingBalance: 348000, paymentStatus: 'Active' },
  { customerName: 'P.Joy printon', month: 'July', totalAmount: 470000, downPayment: 54000, monthlyInstallment: 27000, numberOfMonths: 15, startDate: '2024-07-31', endDate: '2025-10-31', remainingBalance: 416000, paymentStatus: 'Active' },
  { customerName: 'S.Soosainayagam', month: 'July', totalAmount: 430000, downPayment: 47000, monthlyInstallment: 23000, numberOfMonths: 17, startDate: '2024-07-31', endDate: '2025-12-31', remainingBalance: 383000, paymentStatus: 'Active' },
  { customerName: 'A.Jasotharan', month: 'July', totalAmount: 380000, downPayment: 40000, monthlyInstallment: 20000, numberOfMonths: 17, startDate: '2024-07-31', endDate: '2025-12-31', remainingBalance: 340000, paymentStatus: 'Active' },
  { customerName: 'J.Tharshakumar', month: 'July', totalAmount: 460000, downPayment: 52000, monthlyInstallment: 26000, numberOfMonths: 16, startDate: '2024-07-31', endDate: '2025-11-30', remainingBalance: 408000, paymentStatus: 'Active' },
  { customerName: 'K.Judejansan', month: 'July', totalAmount: 420000, downPayment: 45000, monthlyInstallment: 22000, numberOfMonths: 17, startDate: '2024-07-31', endDate: '2025-12-31', remainingBalance: 375000, paymentStatus: 'Active' },
  { customerName: 'S.Judles Figurado', month: 'July', totalAmount: 500000, downPayment: 58000, monthlyInstallment: 29000, numberOfMonths: 15, startDate: '2024-07-31', endDate: '2025-10-31', remainingBalance: 442000, paymentStatus: 'Active' },
  { customerName: 'V.Ajin', month: 'July', totalAmount: 360000, downPayment: 38000, monthlyInstallment: 19000, numberOfMonths: 17, startDate: '2024-07-31', endDate: '2025-12-31', remainingBalance: 322000, paymentStatus: 'Active' },
  { customerName: 'I.Singaravelu', month: 'July', totalAmount: 480000, downPayment: 55000, monthlyInstallment: 28000, numberOfMonths: 15, startDate: '2024-07-31', endDate: '2025-10-31', remainingBalance: 425000, paymentStatus: 'Active' },
  { customerName: 'T.M.Nafees', month: 'July', totalAmount: 410000, downPayment: 44000, monthlyInstallment: 22000, numberOfMonths: 17, startDate: '2024-07-31', endDate: '2025-12-31', remainingBalance: 366000, paymentStatus: 'Active' },
  { customerName: 'S.Jeganathan', month: 'July', totalAmount: 450000, downPayment: 50000, monthlyInstallment: 25000, numberOfMonths: 16, startDate: '2024-07-31', endDate: '2025-11-30', remainingBalance: 400000, paymentStatus: 'Active' },
  { customerName: 'T.A.Muththu culas', month: 'July', totalAmount: 390000, downPayment: 42000, monthlyInstallment: 21000, numberOfMonths: 17, startDate: '2024-07-31', endDate: '2025-12-31', remainingBalance: 348000, paymentStatus: 'Active' },
  { customerName: 'M.N.M.Naflan', month: 'July', totalAmount: 470000, downPayment: 54000, monthlyInstallment: 27000, numberOfMonths: 15, startDate: '2024-07-31', endDate: '2025-10-31', remainingBalance: 416000, paymentStatus: 'Active' },
  { customerName: 'K.Thushyanthan', month: 'July', totalAmount: 430000, downPayment: 47000, monthlyInstallment: 23000, numberOfMonths: 17, startDate: '2024-07-31', endDate: '2025-12-31', remainingBalance: 383000, paymentStatus: 'Active' },
  { customerName: 'S.Nerusan', month: 'July', totalAmount: 380000, downPayment: 40000, monthlyInstallment: 20000, numberOfMonths: 17, startDate: '2024-07-31', endDate: '2025-12-31', remainingBalance: 340000, paymentStatus: 'Active' },
  { customerName: 'Y.M.Milhan', month: 'July', totalAmount: 460000, downPayment: 52000, monthlyInstallment: 26000, numberOfMonths: 16, startDate: '2024-07-31', endDate: '2025-11-30', remainingBalance: 408000, paymentStatus: 'Active' },

  // Additional July entries
  { customerName: 'S.Rajkumar', month: 'July', totalAmount: 420000, downPayment: 45000, monthlyInstallment: 22000, numberOfMonths: 17, startDate: '2024-07-31', endDate: '2025-12-31', remainingBalance: 375000, paymentStatus: 'Active' },
  { customerName: 'V.M.Hllabpichchai', month: 'July', totalAmount: 500000, downPayment: 58000, monthlyInstallment: 29000, numberOfMonths: 15, startDate: '2024-07-31', endDate: '2025-10-31', remainingBalance: 442000, paymentStatus: 'Active' },
  { customerName: 'A.Rojarstalin', month: 'July', totalAmount: 360000, downPayment: 38000, monthlyInstallment: 19000, numberOfMonths: 17, startDate: '2024-07-31', endDate: '2025-12-31', remainingBalance: 322000, paymentStatus: 'Active' },
  { customerName: 'N.Jegatheepan', month: 'July', totalAmount: 480000, downPayment: 55000, monthlyInstallment: 28000, numberOfMonths: 15, startDate: '2024-07-31', endDate: '2025-10-31', remainingBalance: 425000, paymentStatus: 'Active' },
  { customerName: 'T.S.Umma', month: 'July', totalAmount: 410000, downPayment: 44000, monthlyInstallment: 22000, numberOfMonths: 17, startDate: '2024-07-31', endDate: '2025-12-31', remainingBalance: 366000, paymentStatus: 'Active' },
  { customerName: 'S.M.Iqbal', month: 'July', totalAmount: 450000, downPayment: 50000, monthlyInstallment: 25000, numberOfMonths: 16, startDate: '2024-07-31', endDate: '2025-11-30', remainingBalance: 400000, paymentStatus: 'Active' }
];

async function seedInstallmentPlans() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Clear existing installment plans
    await InstallmentPlan.deleteMany({});
    console.log('Cleared existing installment plans');

    // Add installmentId to all records
    const plansWithIds = sampleInstallmentPlans.map((plan, index) => ({
      ...plan,
      installmentId: generateInstallmentId(index + 1)
    }));

    // Insert new installment plans
    const installmentPlans = await InstallmentPlan.insertMany(plansWithIds);
    console.log(`Successfully seeded ${installmentPlans.length} installment plans`);

    // Display summary
    const stats = await InstallmentPlan.aggregate([
      {
        $group: {
          _id: '$month',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    console.log('\nInstallment Plans Summary by Month:');
    stats.forEach(stat => {
      console.log(`${stat._id}: ${stat.count} plans, Total: LKR ${stat.totalAmount.toLocaleString()}`);
    });

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  } catch (error) {
    console.error('Error seeding installment plans:', error);
    process.exit(1);
  }
}

seedInstallmentPlans(); 