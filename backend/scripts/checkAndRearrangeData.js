const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Customer = require('../models/Customer');
const SalesTransaction = require('../models/SalesTransaction');
const InstallmentPlan = require('../models/InstallmentPlan');
const VehicleAllocationCoupon = require('../models/VehicleAllocationCoupon');

dotenv.config({ path: './.env' });

async function checkAndRearrangeData() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('🔗 Connected to MongoDB');
    console.log('='.repeat(60));

    // Check 1: Customer Data Analysis
    console.log('👥 CUSTOMER DATA ANALYSIS:');
    console.log('-'.repeat(30));

    const customers = await Customer.find().sort({ dateOfPurchase: -1 });
    console.log(`Total Customers: ${customers.length}`);

    const customersWithMissingData = customers.filter(c => 
      !c.phoneNo || !c.nicDrivingLicense || !c.address
    );
    console.log(`Customers with missing data: ${customersWithMissingData.length}`);

    if (customersWithMissingData.length > 0) {
      console.log('\n📋 Customers needing data completion:');
      customersWithMissingData.slice(0, 5).forEach(c => {
        console.log(`  - ${c.fullName}: Phone=${c.phoneNo || 'MISSING'}, NIC=${c.nicDrivingLicense || 'MISSING'}`);
      });
    }

    // Check 2: Sales Transaction Data Analysis
    console.log('\n💰 SALES TRANSACTION DATA ANALYSIS:');
    console.log('-'.repeat(40));

    const salesTransactions = await SalesTransaction.find().sort({ saleDate: -1 });
    console.log(`Total Sales Transactions: ${salesTransactions.length}`);

    const salesWithMissingData = salesTransactions.filter(s => 
      !s.customerPhone || !s.customerAddress || !s.vehicleModel
    );
    console.log(`Sales with missing data: ${salesWithMissingData.length}`);

    // Check 3: Installment Plan Data Analysis
    console.log('\n📅 INSTALLMENT PLAN DATA ANALYSIS:');
    console.log('-'.repeat(40));

    const installmentPlans = await InstallmentPlan.find().sort({ startDate: -1 });
    console.log(`Total Installment Plans: ${installmentPlans.length}`);

    const installmentsWithMissingData = installmentPlans.filter(i => 
      !i.customerPhone || !i.customerAddress || !i.vehicleModel
    );
    console.log(`Installments with missing data: ${installmentsWithMissingData.length}`);

    // Check 4: Data Consistency Check
    console.log('\n🔍 DATA CONSISTENCY CHECK:');
    console.log('-'.repeat(30));

    // Check if customer names match across systems
    const customerNames = customers.map(c => c.fullName);
    const salesCustomerNames = salesTransactions.map(s => s.customerName);
    const installmentCustomerNames = installmentPlans.map(i => i.customerName);

    const uniqueCustomerNames = [...new Set(customerNames)];
    const uniqueSalesNames = [...new Set(salesCustomerNames)];
    const uniqueInstallmentNames = [...new Set(installmentCustomerNames)];

    console.log(`Unique customer names in Customer table: ${uniqueCustomerNames.length}`);
    console.log(`Unique customer names in Sales table: ${uniqueSalesNames.length}`);
    console.log(`Unique customer names in Installment table: ${uniqueInstallmentNames.length}`);

    // Check for mismatched names
    const salesMismatches = uniqueSalesNames.filter(name => !uniqueCustomerNames.includes(name));
    const installmentMismatches = uniqueInstallmentNames.filter(name => !uniqueCustomerNames.includes(name));

    if (salesMismatches.length > 0) {
      console.log(`\n⚠️ Sales transactions with unmatched customer names: ${salesMismatches.length}`);
      salesMismatches.slice(0, 3).forEach(name => console.log(`  - ${name}`));
    }

    if (installmentMismatches.length > 0) {
      console.log(`\n⚠️ Installment plans with unmatched customer names: ${installmentMismatches.length}`);
      installmentMismatches.slice(0, 3).forEach(name => console.log(`  - ${name}`));
    }

    // Check 5: Vehicle Allocation Coupon Integration Status
    console.log('\n🎫 VEHICLE ALLOCATION COUPON STATUS:');
    console.log('-'.repeat(40));

    const coupons = await VehicleAllocationCoupon.find().sort({ createdAt: -1 });
    console.log(`Total Vehicle Allocation Coupons: ${coupons.length}`);

    let notIntegrated = [];
    if (coupons.length > 0) {
      const couponsWithIntegration = await Promise.all(
        coupons.map(async (coupon) => {
          const salesTransaction = await SalesTransaction.findOne({ relatedCouponId: coupon.couponId });
          const installmentPlan = await InstallmentPlan.findOne({ relatedCouponId: coupon.couponId });
          return {
            couponId: coupon.couponId,
            hasSalesTransaction: !!salesTransaction,
            hasInstallmentPlan: !!installmentPlan,
            customerName: coupon.fullName
          };
        })
      );

      const fullyIntegrated = couponsWithIntegration.filter(c => c.hasSalesTransaction && c.hasInstallmentPlan);
      const partiallyIntegrated = couponsWithIntegration.filter(c => c.hasSalesTransaction || c.hasInstallmentPlan);
      notIntegrated = couponsWithIntegration.filter(c => !c.hasSalesTransaction && !c.hasInstallmentPlan);

      console.log(`Fully integrated coupons: ${fullyIntegrated.length}`);
      console.log(`Partially integrated coupons: ${partiallyIntegrated.length}`);
      console.log(`Not integrated coupons: ${notIntegrated.length}`);

      if (notIntegrated.length > 0) {
        console.log('\n📋 Coupons needing integration:');
        notIntegrated.slice(0, 3).forEach(c => {
          console.log(`  - ${c.couponId}: ${c.customerName}`);
        });
      }
    }

    // Check 6: Data Quality Score
    console.log('\n📊 DATA QUALITY SCORE:');
    console.log('-'.repeat(25));

    const totalRecords = customers.length + salesTransactions.length + installmentPlans.length;
    const recordsWithMissingData = customersWithMissingData.length + salesWithMissingData.length + installmentsWithMissingData.length;
    const qualityScore = ((totalRecords - recordsWithMissingData) / totalRecords * 100).toFixed(1);

    console.log(`Overall Data Quality Score: ${qualityScore}%`);
    console.log(`Total Records: ${totalRecords}`);
    console.log(`Records with missing data: ${recordsWithMissingData}`);

    // Check 7: Recommendations
    console.log('\n💡 RECOMMENDATIONS:');
    console.log('-'.repeat(20));

    if (customersWithMissingData.length > 0) {
      console.log('1. Complete missing customer data (phone, NIC, address)');
    }

    if (salesMismatches.length > 0 || installmentMismatches.length > 0) {
      console.log('2. Standardize customer names across all systems');
    }

    if (notIntegrated.length > 0) {
      console.log('3. Integrate existing Vehicle Allocation Coupons with Sales and Installment systems');
    }

    if (parseFloat(qualityScore) < 80) {
      console.log('4. Improve data quality by filling missing fields');
    }

    console.log('\n🎉 DATA ANALYSIS COMPLETED!');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Analysis failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the analysis
checkAndRearrangeData(); 