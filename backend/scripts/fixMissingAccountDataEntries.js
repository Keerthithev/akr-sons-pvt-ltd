const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const AccountData = require('../models/AccountData');
const VehicleAllocationCoupon = require('../models/VehicleAllocationCoupon');
const BankDeposit = require('../models/BankDeposit');
const AdvancedCustomer = require('../models/AdvancedCustomer');

async function fixMissingAccountDataEntries() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('🔧 FIXING MISSING ACCOUNT DATA ENTRIES');
    console.log('======================================\n');

    let totalCreated = 0;

    // 1. Fix VAC Payment Entries
    console.log('🚗 Creating missing VAC payment entries...');
    
    const vacsWithPayments = await VehicleAllocationCoupon.find({
      $or: [
        { advancePayment: { $gt: 0 } },
        { downPayment: { $gt: 0 } },
        { regFee: { $gt: 0 } },
        { docCharge: { $gt: 0 } }
      ]
    });

    for (const vac of vacsWithPayments) {
      const accountDataEntries = [];

      // Create advance payment entry if missing
      if (vac.advancePayment > 0) {
        const existingAdvanceEntry = await AccountData.findOne({
          details: { $regex: `Advance Payment Collection - Vehicle Allocation Coupon ${vac.couponId}`, $options: 'i' },
          type: 'Advance Payment'
        });
        
        if (!existingAdvanceEntry) {
          const advanceEntry = new AccountData({
            date: vac.dateOfPurchase || vac.date || new Date(),
            name: vac.fullName,
            details: `Advance Payment Collection - Vehicle Allocation Coupon ${vac.couponId} - ${vac.vehicleType}`,
            amount: -vac.advancePayment, // Negative amount for money collected
            model: vac.vehicleType,
            type: 'Advance Payment',
            depositedToBank: false,
            depositedAmount: 0,
            bankDepositDate: null,
            notes: `Advance payment collected for vehicle allocation coupon ${vac.couponId} | Actual: ${vac.advancePayment} | Collected: ${vac.advancePayment}`
          });
          accountDataEntries.push(advanceEntry);
          console.log(`  ✅ Created Advance Payment entry for VAC ${vac.couponId} (LKR ${vac.advancePayment})`);
        }
      }

      // Create down payment entry if missing
      if (vac.downPayment > 0) {
        const existingDownPaymentEntry = await AccountData.findOne({
          details: { $regex: `Down Payment Collection - Vehicle Allocation Coupon ${vac.couponId}`, $options: 'i' },
          type: 'Down Payment'
        });
        
        if (!existingDownPaymentEntry) {
          const downPaymentEntry = new AccountData({
            date: vac.downPaymentDate || vac.dateOfPurchase || vac.date || new Date(),
            name: vac.fullName,
            details: `Down Payment Collection - Vehicle Allocation Coupon ${vac.couponId} - ${vac.vehicleType}`,
            amount: -vac.downPayment, // Negative amount for money collected
            model: vac.vehicleType,
            type: 'Down Payment',
            depositedToBank: false,
            depositedAmount: 0,
            bankDepositDate: null,
            notes: `Down payment collected for vehicle allocation coupon ${vac.couponId} | Actual: ${vac.downPayment} | Collected: ${vac.downPayment}`
          });
          accountDataEntries.push(downPaymentEntry);
          console.log(`  ✅ Created Down Payment entry for VAC ${vac.couponId} (LKR ${vac.downPayment})`);
        }
      }

      // Create registration fee entry if missing
      if (vac.regFee > 0) {
        const existingRegFeeEntry = await AccountData.findOne({
          details: { $regex: `Registration Fee Collection - Vehicle Allocation Coupon ${vac.couponId}`, $options: 'i' },
          type: 'Registration Fee'
        });
        
        if (!existingRegFeeEntry) {
          const regFeeEntry = new AccountData({
            date: vac.dateOfPurchase || vac.date || new Date(),
            name: vac.fullName,
            details: `Registration Fee Collection - Vehicle Allocation Coupon ${vac.couponId} - ${vac.vehicleType}`,
            amount: -vac.regFee, // Negative amount for money collected
            model: vac.vehicleType,
            type: 'Registration Fee',
            depositedToBank: false,
            depositedAmount: 0,
            bankDepositDate: null,
            notes: `Registration fee collected for vehicle allocation coupon ${vac.couponId} | Actual: ${vac.regFee} | Collected: ${vac.regFee}`
          });
          accountDataEntries.push(regFeeEntry);
          console.log(`  ✅ Created Registration Fee entry for VAC ${vac.couponId} (LKR ${vac.regFee})`);
        }
      }

      // Create document charge entry if missing
      if (vac.docCharge > 0) {
        const existingDocChargeEntry = await AccountData.findOne({
          details: { $regex: `Document Charge Collection - Vehicle Allocation Coupon ${vac.couponId}`, $options: 'i' },
          type: 'Document Charge'
        });
        
        if (!existingDocChargeEntry) {
          const docChargeEntry = new AccountData({
            date: vac.dateOfPurchase || vac.date || new Date(),
            name: vac.fullName,
            details: `Document Charge Collection - Vehicle Allocation Coupon ${vac.couponId} - ${vac.vehicleType}`,
            amount: -vac.docCharge, // Negative amount for money collected
            model: vac.vehicleType,
            type: 'Document Charge',
            depositedToBank: false,
            depositedAmount: 0,
            bankDepositDate: null,
            notes: `Document charge collected for vehicle allocation coupon ${vac.couponId} | Actual: ${vac.docCharge} | Collected: ${vac.docCharge}`
          });
          accountDataEntries.push(docChargeEntry);
          console.log(`  ✅ Created Document Charge entry for VAC ${vac.couponId} (LKR ${vac.docCharge})`);
        }
      }

      // Save all entries for this VAC
      if (accountDataEntries.length > 0) {
        await AccountData.insertMany(accountDataEntries);
        totalCreated += accountDataEntries.length;
      }
    }

    // 2. Fix Bank Deposit Entries
    console.log('\n🏦 Creating missing bank deposit entries...');
    
    const bankDeposits = await BankDeposit.find();

    for (const deposit of bankDeposits) {
      const existingBankEntry = await AccountData.findOne({
        details: { $regex: `Bank Deposit - ${deposit.purpose}`, $options: 'i' },
        type: 'Bank Deposit',
        name: deposit.depositerName,
        date: deposit.date
      });
      
      if (!existingBankEntry) {
        const bankEntry = new AccountData({
          date: deposit.date,
          name: deposit.depositerName,
          details: `Bank Deposit - ${deposit.purpose}`,
          amount: deposit.payment, // Positive amount for deposit
          type: 'Bank Deposit',
          depositedToBank: true,
          depositedAmount: deposit.payment,
          bankDepositDate: deposit.date,
          notes: `Bank deposit created from Bank Deposit record`
        });
        
        await bankEntry.save();
        totalCreated++;
        console.log(`  ✅ Created Bank Deposit entry for: ${deposit.depositerName} - ${deposit.purpose} (LKR ${deposit.payment})`);
      }
    }

    // 3. Fix Advanced Customer Entries
    console.log('\n👥 Creating missing advanced customer entries...');
    
    const advancedCustomersWithAdvance = await AdvancedCustomer.find({
      advanceAmount: { $gt: 0 }
    });

    for (const customer of advancedCustomersWithAdvance) {
      const existingAdvancedEntry = await AccountData.findOne({
        details: { $regex: `Advanced Customer - ${customer.customerName}`, $options: 'i' },
        type: 'Advanced Customer'
      });
      
      if (!existingAdvancedEntry) {
        const advancedEntry = new AccountData({
          date: customer.preBookingDate || new Date(),
          name: customer.customerName,
          details: `Advanced Customer - ${customer.customerName} - ${customer.bikeModel} ${customer.bikeColor}`,
          amount: -customer.advanceAmount, // Negative amount for money collected
          model: customer.bikeModel,
          type: 'Advanced Customer',
          depositedToBank: false,
          depositedAmount: 0,
          bankDepositDate: null,
          notes: `Advanced customer pre-booking for ${customer.bikeModel} ${customer.bikeColor} | Actual: ${customer.advanceAmount} | Collected: ${customer.advanceAmount}`
        });
        
        await advancedEntry.save();
        totalCreated++;
        console.log(`  ✅ Created Advanced Customer entry for: ${customer.customerName} (LKR ${customer.advanceAmount})`);
      }
    }

    // 4. Update existing Account Data records to have proper types
    console.log('\n🔄 Updating existing Account Data records with proper types...');
    
    const recordsWithoutType = await AccountData.find({ type: { $exists: false } });
    
    for (const record of recordsWithoutType) {
      // Try to determine type based on details
      let newType = 'Manual Entry';
      
      if (record.details.includes('Down Payment')) {
        newType = 'Down Payment';
      } else if (record.details.includes('Advance')) {
        newType = 'Advance Payment';
      } else if (record.details.includes('Registration')) {
        newType = 'Registration Fee';
      } else if (record.details.includes('Document')) {
        newType = 'Document Charge';
      } else if (record.details.includes('Bank Deposit')) {
        newType = 'Bank Deposit';
      } else if (record.details.includes('Advanced Customer')) {
        newType = 'Advanced Customer';
      }
      
      record.type = newType;
      await record.save();
      console.log(`  ✅ Updated record type to "${newType}" for: ${record.details}`);
    }

    // 5. Summary
    console.log('\n📈 MIGRATION SUMMARY:');
    console.log('=====================');
    console.log(`Total new entries created: ${totalCreated}`);
    console.log(`Records updated with types: ${recordsWithoutType.length}`);
    
    // 6. Final verification
    console.log('\n🔍 Running final verification...');
    
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

    console.log('\n🎉 Migration completed successfully!');
    console.log('All missing Account Data entries have been created.');
    console.log('Your Account Data tab should now show complete financial records.');

    await mongoose.disconnect();
    console.log('\n✅ Database connection closed');

  } catch (error) {
    console.error('❌ Error during migration:', error);
    process.exit(1);
  }
}

fixMissingAccountDataEntries(); 