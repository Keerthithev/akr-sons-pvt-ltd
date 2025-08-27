const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const AccountData = require('../models/AccountData');

async function fixAccountDataTypes() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('🔧 FIXING ACCOUNT DATA TYPES');
    console.log('============================\n');

    let updatedCount = 0;
    let deletedCount = 0;

    // Get all Account Data entries
    const allAccountData = await AccountData.find();
    console.log(`Total Account Data records: ${allAccountData.length}`);

    // Group by details to find duplicates
    const groupedByDetails = {};
    allAccountData.forEach(record => {
      const key = record.details;
      if (!groupedByDetails[key]) {
        groupedByDetails[key] = [];
      }
      groupedByDetails[key].push(record);
    });

    // Process each group
    for (const [details, records] of Object.entries(groupedByDetails)) {
      if (records.length > 1) {
        console.log(`\n🔍 Found ${records.length} duplicates for: ${details}`);
        
        // Keep the one with proper type or the first one
        const recordToKeep = records.find(r => r.type && r.type !== 'No Type') || records[0];
        const recordsToDelete = records.filter(r => r._id.toString() !== recordToKeep._id.toString());
        
        console.log(`  Keeping: ${recordToKeep._id} (Type: ${recordToKeep.type || 'No Type'})`);
        recordsToDelete.forEach(r => {
          console.log(`  Deleting: ${r._id} (Type: ${r.type || 'No Type'})`);
        });
        
        // Delete duplicates
        for (const record of recordsToDelete) {
          await AccountData.findByIdAndDelete(record._id);
          deletedCount++;
        }
      }
    }

    // Now fix types for remaining records
    console.log('\n🔄 Fixing types for remaining records...');
    
    const remainingRecords = await AccountData.find();
    
    for (const record of remainingRecords) {
      let newType = 'Manual Entry';
      let needsUpdate = false;
      
      // Determine type based on details
      if (record.details.includes('Advance Payment Collection')) {
        newType = 'Advance Payment';
      } else if (record.details.includes('Down Payment Collection')) {
        newType = 'Down Payment';
      } else if (record.details.includes('Registration Fee Collection')) {
        newType = 'Registration Fee';
      } else if (record.details.includes('Document Charge Collection')) {
        newType = 'Document Charge';
      } else if (record.details.includes('Bank Deposit -')) {
        newType = 'Bank Deposit';
      } else if (record.details.includes('Advanced Customer -')) {
        newType = 'Advanced Customer';
      } else if (record.details.includes('Advanced Customer Pre-Booking')) {
        newType = 'Advanced Customer';
      }
      
      // Update if type is different
      if (record.type !== newType) {
        record.type = newType;
        await record.save();
        updatedCount++;
        console.log(`  ✅ Updated type to "${newType}" for: ${record.details}`);
      }
    }

    // Final summary
    console.log('\n📈 FIX SUMMARY:');
    console.log('===============');
    console.log(`Records updated with types: ${updatedCount}`);
    console.log(`Duplicate records deleted: ${deletedCount}`);
    
    // Final verification
    console.log('\n🔍 Final verification...');
    
    const finalAccountDataCount = await AccountData.countDocuments();
    console.log(`Final Account Data records: ${finalAccountDataCount}`);
    
    const finalAccountDataByType = await AccountData.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    console.log('\n📋 Final Account Data by Type:');
    finalAccountDataByType.forEach(type => {
      console.log(`  ${type._id}: ${type.count} records, Total: LKR ${type.totalAmount.toLocaleString()}`);
    });

    console.log('\n🎉 Account Data types fixed successfully!');

    await mongoose.disconnect();
    console.log('\n✅ Database connection closed');

  } catch (error) {
    console.error('❌ Error fixing account data types:', error);
    process.exit(1);
  }
}

fixAccountDataTypes(); 