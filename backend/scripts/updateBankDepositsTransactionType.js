const mongoose = require('mongoose');
const BankDeposit = require('../models/BankDeposit');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/akr-sons', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function updateBankDepositsTransactionType() {
  try {
    console.log('Starting migration: Update Bank Deposits Transaction Type...');
    
    // Find all records without transactionType or with null/undefined transactionType
    const recordsToUpdate = await BankDeposit.find({
      $or: [
        { transactionType: { $exists: false } },
        { transactionType: null },
        { transactionType: undefined },
        { transactionType: '' }
      ]
    });
    
    console.log(`Found ${recordsToUpdate.length} records to update`);
    
    if (recordsToUpdate.length > 0) {
      // Update records based on payment amount
      const result = await BankDeposit.updateMany(
        {
          $or: [
            { transactionType: { $exists: false } },
            { transactionType: null },
            { transactionType: undefined },
            { transactionType: '' }
          ]
        },
        [
          {
            $set: {
              transactionType: {
                $cond: {
                  if: { $gte: ['$payment', 0] },
                  then: 'income',
                  else: 'outcome'
                }
              },
              category: 'Legacy Transaction',
              description: 'Migrated from existing record'
            }
          }
        ]
      );
      
      console.log(`Successfully updated ${result.modifiedCount} records`);
    } else {
      console.log('No records need to be updated');
    }
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the migration
updateBankDepositsTransactionType(); 