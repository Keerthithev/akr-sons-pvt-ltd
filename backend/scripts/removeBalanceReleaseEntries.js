const mongoose = require('mongoose');
const AccountData = require('../models/AccountData');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/akr-sons', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function removeBalanceReleaseEntries() {
  try {
    console.log('Starting to remove balance release entries from Account Data...');
    
    // Find all balance release entries
    const balanceEntries = await AccountData.find({
      $or: [
        { details: { $regex: 'Balance Payment', $options: 'i' } },
        { remarks: { $regex: 'Balance Payment', $options: 'i' } },
        { details: { $regex: 'Balance.*Cheque', $options: 'i' } },
        { remarks: { $regex: 'Balance.*Cheque', $options: 'i' } }
      ]
    });
    
    console.log(`Found ${balanceEntries.length} balance release entries to remove:`);
    
    balanceEntries.forEach(entry => {
      console.log(`- ${entry.date}: ${entry.name} - ${entry.details} - LKR ${entry.amount}`);
    });
    
    if (balanceEntries.length === 0) {
      console.log('No balance release entries found.');
      return;
    }
    
    // Remove the balance release entries
    const result = await AccountData.deleteMany({
      $or: [
        { details: { $regex: 'Balance Payment', $options: 'i' } },
        { remarks: { $regex: 'Balance Payment', $options: 'i' } },
        { details: { $regex: 'Balance.*Cheque', $options: 'i' } },
        { remarks: { $regex: 'Balance.*Cheque', $options: 'i' } }
      ]
    });
    
    console.log(`\nSuccessfully removed ${result.deletedCount} balance release entries from Account Data.`);
    console.log('Account Data is now clean of incorrect balance release entries.');
    
  } catch (error) {
    console.error('Error removing balance release entries:', error);
  } finally {
    mongoose.connection.close();
  }
}

removeBalanceReleaseEntries(); 