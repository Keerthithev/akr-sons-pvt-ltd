const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const AccountData = require('../models/AccountData');
const VehicleAllocationCoupon = require('../models/VehicleAllocationCoupon');
const BankDeposit = require('../models/BankDeposit');
const AdvancedCustomer = require('../models/AdvancedCustomer');

async function checkAccountDataStatus() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('🔍 CHECKING ACCOUNT DATA STATUS');
    console.log('================================\n');

    // 1. Check total Account Data records
    const totalAccountData = await AccountData.countDocuments();
    console.log(`📊 Total Account Data Records: ${totalAccountData}`);

    // 2. Check Account Data by type
    const accountDataByType = await AccountData.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    console.log('\n📋 Account Data by Type:');
    accountDataByType.forEach(type => {
      console.log(`  ${type._id || 'No Type'}: ${type.count} records, Total: LKR ${type.totalAmount.toLocaleString()}`);
    });

    // 3. Check deposited vs non-deposited records
    const depositedRecords = await AccountData.countDocuments({ depositedToBank: true });
    const nonDepositedRecords = await AccountData.countDocuments({ depositedToBank: false });
    
    console.log('\n💰 Deposit Status:');
    console.log(`  Deposited to Bank: ${depositedRecords} records`);
    console.log(`  Not Deposited: ${nonDepositedRecords} records`);

    // 4. Check VAC records
    const totalVACs = await VehicleAllocationCoupon.countDocuments();
    console.log(`\n🚗 Total Vehicle Allocation Coupons: ${totalVACs}`);

    // 5. Check VACs by payment method
    const vacsByPaymentMethod = await VehicleAllocationCoupon.aggregate([
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          totalAdvance: { $sum: '$advancePayment' },
          totalDownPayment: { $sum: '$downPayment' },
          totalRegFee: { $sum: '$regFee' },
          totalDocCharge: { $sum: '$docCharge' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    console.log('\n💳 VACs by Payment Method:');
    vacsByPaymentMethod.forEach(method => {
      console.log(`  ${method._id}: ${method.count} VACs`);
      console.log(`    Total Advance: LKR ${method.totalAdvance.toLocaleString()}`);
      console.log(`    Total Down Payment: LKR ${method.totalDownPayment.toLocaleString()}`);
      console.log(`    Total Reg Fee: LKR ${method.totalRegFee.toLocaleString()}`);
      console.log(`    Total Doc Charge: LKR ${method.totalDocCharge.toLocaleString()}`);
    });

    // 6. Check Bank Deposits
    const totalBankDeposits = await BankDeposit.countDocuments();
    console.log(`\n🏦 Total Bank Deposits: ${totalBankDeposits}`);

    const bankDepositsByType = await BankDeposit.aggregate([
      {
        $group: {
          _id: '$transactionType',
          count: { $sum: 1 },
          totalAmount: { $sum: '$payment' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    console.log('\n💸 Bank Deposits by Type:');
    bankDepositsByType.forEach(type => {
      console.log(`  ${type._id || 'No Type'}: ${type.count} deposits, Total: LKR ${type.totalAmount.toLocaleString()}`);
    });

    // 7. Check Advanced Customers
    const totalAdvancedCustomers = await AdvancedCustomer.countDocuments();
    console.log(`\n👥 Total Advanced Customers: ${totalAdvancedCustomers}`);

    // 8. VERIFICATION: Check if VAC payments have corresponding Account Data entries
    console.log('\n🔍 VERIFYING VAC PAYMENT ENTRIES:');
    console.log('==================================');

    const vacsWithPayments = await VehicleAllocationCoupon.find({
      $or: [
        { advancePayment: { $gt: 0 } },
        { downPayment: { $gt: 0 } },
        { regFee: { $gt: 0 } },
        { docCharge: { $gt: 0 } }
      ]
    });

    console.log(`Found ${vacsWithPayments.length} VACs with payments`);

    let missingEntries = 0;
    let foundEntries = 0;

    for (const vac of vacsWithPayments) {
      // Check for advance payment entry
      if (vac.advancePayment > 0) {
        const advanceEntry = await AccountData.findOne({
          details: { $regex: `Advance Payment Collection - Vehicle Allocation Coupon ${vac.couponId}`, $options: 'i' },
          type: 'Advance Payment'
        });
        
        if (!advanceEntry) {
          console.log(`❌ Missing Advance Payment entry for VAC ${vac.couponId} (LKR ${vac.advancePayment})`);
          missingEntries++;
        } else {
          foundEntries++;
        }
      }

      // Check for down payment entry
      if (vac.downPayment > 0) {
        const downPaymentEntry = await AccountData.findOne({
          details: { $regex: `Down Payment Collection - Vehicle Allocation Coupon ${vac.couponId}`, $options: 'i' },
          type: 'Down Payment'
        });
        
        if (!downPaymentEntry) {
          console.log(`❌ Missing Down Payment entry for VAC ${vac.couponId} (LKR ${vac.downPayment})`);
          missingEntries++;
        } else {
          foundEntries++;
        }
      }

      // Check for registration fee entry
      if (vac.regFee > 0) {
        const regFeeEntry = await AccountData.findOne({
          details: { $regex: `Registration Fee Collection - Vehicle Allocation Coupon ${vac.couponId}`, $options: 'i' },
          type: 'Registration Fee'
        });
        
        if (!regFeeEntry) {
          console.log(`❌ Missing Registration Fee entry for VAC ${vac.couponId} (LKR ${vac.regFee})`);
          missingEntries++;
        } else {
          foundEntries++;
        }
      }

      // Check for document charge entry
      if (vac.docCharge > 0) {
        const docChargeEntry = await AccountData.findOne({
          details: { $regex: `Document Charge Collection - Vehicle Allocation Coupon ${vac.couponId}`, $options: 'i' },
          type: 'Document Charge'
        });
        
        if (!docChargeEntry) {
          console.log(`❌ Missing Document Charge entry for VAC ${vac.couponId} (LKR ${vac.docCharge})`);
          missingEntries++;
        } else {
          foundEntries++;
        }
      }
    }

    console.log(`\n✅ Found ${foundEntries} correct entries`);
    console.log(`❌ Missing ${missingEntries} entries`);

    // 9. VERIFICATION: Check if Bank Deposits have corresponding Account Data entries
    console.log('\n🔍 VERIFYING BANK DEPOSIT ENTRIES:');
    console.log('===================================');

    const bankDeposits = await BankDeposit.find();
    console.log(`Found ${bankDeposits.length} bank deposits`);

    let missingBankEntries = 0;
    let foundBankEntries = 0;

    for (const deposit of bankDeposits) {
      const bankEntry = await AccountData.findOne({
        details: { $regex: `Bank Deposit - ${deposit.purpose}`, $options: 'i' },
        type: 'Bank Deposit',
        name: deposit.depositerName,
        date: deposit.date
      });
      
      if (!bankEntry) {
        console.log(`❌ Missing Bank Deposit entry for: ${deposit.depositerName} - ${deposit.purpose} (LKR ${deposit.payment})`);
        missingBankEntries++;
      } else {
        foundBankEntries++;
      }
    }

    console.log(`\n✅ Found ${foundBankEntries} correct bank deposit entries`);
    console.log(`❌ Missing ${missingBankEntries} bank deposit entries`);

    // 10. VERIFICATION: Check if Advanced Customers have corresponding Account Data entries
    console.log('\n🔍 VERIFYING ADVANCED CUSTOMER ENTRIES:');
    console.log('========================================');

    const advancedCustomersWithAdvance = await AdvancedCustomer.find({
      advanceAmount: { $gt: 0 }
    });

    console.log(`Found ${advancedCustomersWithAdvance.length} advanced customers with advance payments`);

    let missingAdvancedEntries = 0;
    let foundAdvancedEntries = 0;

    for (const customer of advancedCustomersWithAdvance) {
      const advancedEntry = await AccountData.findOne({
        details: { $regex: `Advanced Customer - ${customer.customerName}`, $options: 'i' },
        type: 'Advanced Customer'
      });
      
      if (!advancedEntry) {
        console.log(`❌ Missing Advanced Customer entry for: ${customer.customerName} (LKR ${customer.advanceAmount})`);
        missingAdvancedEntries++;
      } else {
        foundAdvancedEntries++;
      }
    }

    console.log(`\n✅ Found ${foundAdvancedEntries} correct advanced customer entries`);
    console.log(`❌ Missing ${missingAdvancedEntries} advanced customer entries`);

    // 11. SUMMARY
    console.log('\n📈 SUMMARY:');
    console.log('===========');
    console.log(`Total Account Data Records: ${totalAccountData}`);
    console.log(`Total VACs: ${totalVACs}`);
    console.log(`Total Bank Deposits: ${totalBankDeposits}`);
    console.log(`Total Advanced Customers: ${totalAdvancedCustomers}`);
    console.log(`\nMissing VAC Payment Entries: ${missingEntries}`);
    console.log(`Missing Bank Deposit Entries: ${missingBankEntries}`);
    console.log(`Missing Advanced Customer Entries: ${missingAdvancedEntries}`);
    
    const totalMissing = missingEntries + missingBankEntries + missingAdvancedEntries;
    if (totalMissing === 0) {
      console.log('\n🎉 ALL DATA IS CONSISTENT! No missing entries found.');
    } else {
      console.log(`\n⚠️  TOTAL MISSING ENTRIES: ${totalMissing}`);
      console.log('Consider running a data fix script to create missing entries.');
    }

    await mongoose.disconnect();
    console.log('\n✅ Database connection closed');

  } catch (error) {
    console.error('❌ Error checking account data status:', error);
    process.exit(1);
  }
}

checkAccountDataStatus(); 