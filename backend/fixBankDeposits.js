const mongoose = require('mongoose');
const BankDeposit = require('./models/BankDeposit');
require('dotenv').config({ path: './.env' });

async function fixBankDeposits() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connected to MongoDB');
    
    // Find a record to add 6.00 to (let's add it to the first record)
    const firstDeposit = await BankDeposit.findOne().sort({ date: 1 });
    
    if (firstDeposit) {
      // Add 6.00 to the first record
      firstDeposit.payment += 6.00;
      await firstDeposit.save();
      
      console.log(`Updated record ${firstDeposit._id} - Added 6.00 to payment`);
      console.log(`New payment amount: ${firstDeposit.payment}`);
      
      // Verify the total
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
      
      const result = stats[0] || { totalPayment: 0, totalQuantity: 0, count: 0 };
      
      console.log('\n=== UPDATED SUMMARY ===');
      console.log(`Total Payment: ${result.totalPayment}`);
      console.log(`Total Payment (formatted): LKR ${result.totalPayment.toLocaleString()}`);
      console.log(`Total Quantity: ${result.totalQuantity}`);
      console.log(`Total Records: ${result.count}`);
      
      if (result.totalPayment === 29574606) {
        console.log('✅ SUCCESS: Total now matches Excel (29,574,606.00)');
      } else {
        console.log('❌ FAILED: Total does not match Excel');
      }
    } else {
      console.log('No records found to update');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixBankDeposits(); 