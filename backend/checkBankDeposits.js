const mongoose = require('mongoose');
const BankDeposit = require('./models/BankDeposit');
require('dotenv').config({ path: './.env' });

async function checkTotals() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connected to MongoDB');
    
    // Get all records with payment amounts
    const deposits = await BankDeposit.find({}).sort({ date: 1 });
    
    let totalPayment = 0;
    let totalQuantity = 0;
    
    console.log('Payment amounts by date:');
    deposits.forEach((deposit, index) => {
      totalPayment += deposit.payment;
      totalQuantity += deposit.quantity;
      console.log(`${index + 1}. ${deposit.date.toISOString().split('T')[0]} - ${deposit.payment}`);
    });
    
    console.log('\n=== SUMMARY ===');
    console.log(`Total Payment: ${totalPayment}`);
    console.log(`Total Payment (formatted): LKR ${totalPayment.toLocaleString()}`);
    console.log(`Total Quantity: ${totalQuantity}`);
    console.log(`Total Records: ${deposits.length}`);
    
    // Check for any decimal values
    const decimalPayments = deposits.filter(d => d.payment % 1 !== 0);
    if (decimalPayments.length > 0) {
      console.log('\n=== DECIMAL PAYMENTS ===');
      decimalPayments.forEach(d => {
        console.log(`${d.date.toISOString().split('T')[0]} - ${d.payment}`);
      });
    }
    
    // Check specific records that might have the difference
    console.log('\n=== CHECKING FOR 6.00 DIFFERENCE ===');
    const targetAmount = 29574606.00;
    const currentAmount = totalPayment;
    const difference = targetAmount - currentAmount;
    console.log(`Expected: ${targetAmount}`);
    console.log(`Current: ${currentAmount}`);
    console.log(`Difference: ${difference}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkTotals(); 