const mongoose = require('mongoose');
const dotenv = require('dotenv');
const VehicleAllocationCoupon = require('../models/VehicleAllocationCoupon');
const SalesTransaction = require('../models/SalesTransaction');
const InstallmentPlan = require('../models/InstallmentPlan');
const Customer = require('../models/Customer');
const vehicleAllocationCouponController = require('../controllers/vehicleAllocationCouponController');

dotenv.config({ path: './.env' });

async function testCompleteWorkflow() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('🔗 Connected to MongoDB');
    console.log('='.repeat(60));

    console.log('🧪 COMPREHENSIVE VEHICLE ALLOCATION COUPON WORKFLOW TEST');
    console.log('='.repeat(60));

    // Test 1: Create Vehicle Allocation Coupon with full payment
    console.log('\n📝 TEST 1: FULL PAYMENT COUPON');
    console.log('-'.repeat(30));

    const fullPaymentCouponData = {
      workshopNo: 'WS-001',
      branch: 'Main Branch',
      date: new Date(),
      fullName: 'John Full Payment Customer',
      address: '123 Full Payment Street, Colombo',
      nicNo: '199012345678',
      contactNo: '0771234567',
      occupation: 'Engineer',
      dateOfBirth: '1990-01-01',
      vehicleType: 'Honda CD 70',
      engineNo: 'ENG123456',
      chassisNo: 'CHS789012',
      dateOfPurchase: new Date(),
      leasingCompany: 'Test Leasing Co.',
      officerName: 'John Officer',
      officerContactNo: '0777654321',
      commissionPercentage: 5,
      totalAmount: 200000,
      balance: 0, // Full payment
      downPayment: 200000,
      regFee: 10200,
      docCharge: 5000,
      insuranceCo: 'Test Insurance Co.',
      firstInstallment: { amount: 0, date: null },
      secondInstallment: { amount: 0, date: null },
      thirdInstallment: { amount: 0, date: null },
      chequeNo: 'CHQ123456',
      chequeAmount: 200000,
      paymentType: 'Cash',
      vehicleIssueDate: new Date(),
      vehicleIssueTime: '10:00 AM',
      status: 'Completed',
      notes: 'Full payment test coupon',
      discountApplied: true,
      discountAmount: 15000
    };

    const mockReq1 = { body: fullPaymentCouponData };
    const mockRes1 = {
      status: (code) => ({
        json: (data) => {
          console.log(`✅ Full payment coupon created with status ${code}`);
          return data;
        }
      })
    };

    await vehicleAllocationCouponController.createVehicleAllocationCoupon(mockReq1, mockRes1, () => {});

    // Verify full payment coupon
    const fullPaymentCoupon = await VehicleAllocationCoupon.findOne({ fullName: 'John Full Payment Customer' });
    const fullPaymentSales = await SalesTransaction.findOne({ relatedCouponId: fullPaymentCoupon?.couponId });
    const fullPaymentInstallment = await InstallmentPlan.findOne({ relatedCouponId: fullPaymentCoupon?.couponId });

    console.log(`✅ Full Payment Coupon: ${fullPaymentCoupon?.couponId}`);
    console.log(`✅ Sales Transaction: ${fullPaymentSales ? 'Created' : 'Not needed'}`);
    console.log(`✅ Installment Plan: ${fullPaymentInstallment ? 'Created' : 'Not needed (full payment)'}`);

    // Test 2: Create Vehicle Allocation Coupon with partial payment
    console.log('\n📝 TEST 2: PARTIAL PAYMENT COUPON');
    console.log('-'.repeat(30));

    const partialPaymentCouponData = {
      workshopNo: 'WS-002',
      branch: 'Branch 2',
      date: new Date(),
      fullName: 'Jane Partial Payment Customer',
      address: '456 Partial Payment Avenue, Kandy',
      nicNo: '199112345678',
      contactNo: '0772345678',
      occupation: 'Doctor',
      dateOfBirth: '1991-02-02',
      vehicleType: 'Honda CG 125',
      engineNo: 'ENG234567',
      chassisNo: 'CHS890123',
      dateOfPurchase: new Date(),
      leasingCompany: 'Another Leasing Co.',
      officerName: 'Jane Officer',
      officerContactNo: '0776543210',
      commissionPercentage: 7,
      totalAmount: 300000,
      balance: 200000, // Partial payment
      downPayment: 100000,
      regFee: 10200,
      docCharge: 5000,
      insuranceCo: 'Another Insurance Co.',
      firstInstallment: { 
        amount: 66667, 
        date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) 
      },
      secondInstallment: { 
        amount: 66667, 
        date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) 
      },
      thirdInstallment: { 
        amount: 66666, 
        date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) 
      },
      chequeNo: 'CHQ234567',
      chequeAmount: 100000,
      paymentType: 'Bank Draft',
      vehicleIssueDate: new Date(),
      vehicleIssueTime: '2:00 PM',
      status: 'Pending',
      notes: 'Partial payment test coupon',
      discountApplied: false,
      discountAmount: 0
    };

    const mockReq2 = { body: partialPaymentCouponData };
    const mockRes2 = {
      status: (code) => ({
        json: (data) => {
          console.log(`✅ Partial payment coupon created with status ${code}`);
          return data;
        }
      })
    };

    await vehicleAllocationCouponController.createVehicleAllocationCoupon(mockReq2, mockRes2, () => {});

    // Verify partial payment coupon
    const partialPaymentCoupon = await VehicleAllocationCoupon.findOne({ fullName: 'Jane Partial Payment Customer' });
    const partialPaymentSales = await SalesTransaction.findOne({ relatedCouponId: partialPaymentCoupon?.couponId });
    const partialPaymentInstallment = await InstallmentPlan.findOne({ relatedCouponId: partialPaymentCoupon?.couponId });

    console.log(`✅ Partial Payment Coupon: ${partialPaymentCoupon?.couponId}`);
    console.log(`✅ Sales Transaction: ${partialPaymentSales?.transactionId}`);
    console.log(`✅ Installment Plan: ${partialPaymentInstallment?.installmentId}`);

    // Test 3: Update coupon and verify integration
    console.log('\n📝 TEST 3: UPDATE INTEGRATION');
    console.log('-'.repeat(30));

    if (partialPaymentCoupon) {
      const updateData = {
        fullName: 'Jane Updated Customer',
        totalAmount: 350000,
        balance: 250000,
        notes: 'Updated test coupon'
      };

      const updateReq = { 
        params: { id: partialPaymentCoupon._id },
        body: updateData 
      };
      const updateRes = {
        json: (data) => {
          console.log('✅ Coupon updated successfully');
          return data;
        }
      };

      await vehicleAllocationCouponController.updateVehicleAllocationCoupon(updateReq, updateRes, () => {});

      // Verify updates
      const updatedSales = await SalesTransaction.findOne({ relatedCouponId: partialPaymentCoupon.couponId });
      const updatedInstallment = await InstallmentPlan.findOne({ relatedCouponId: partialPaymentCoupon.couponId });

      if (updatedSales && updatedSales.customerName === 'Jane Updated Customer') {
        console.log('✅ Sales Transaction updated successfully');
      }

      if (updatedInstallment && updatedInstallment.totalAmount === 350000) {
        console.log('✅ Installment Plan updated successfully');
      }
    }

    // Test 4: Test different payment types
    console.log('\n📝 TEST 4: DIFFERENT PAYMENT TYPES');
    console.log('-'.repeat(30));

    const paymentTypes = ['Cash', 'Bank Draft', 'Online', 'Credit Card'];
    
    for (let i = 0; i < paymentTypes.length; i++) {
      const paymentTypeData = {
        workshopNo: `WS-${i + 3}`,
        branch: `Branch ${i + 3}`,
        date: new Date(),
        fullName: `Customer ${paymentTypes[i]}`,
        address: `${i + 1}23 ${paymentTypes[i]} Street`,
        nicNo: `199${i}12345678`,
        contactNo: `077${i}2345678`,
        occupation: 'Test',
        dateOfBirth: '1990-01-01',
        vehicleType: 'Honda CD 70',
        engineNo: `ENG${i}23456`,
        chassisNo: `CHS${i}89012`,
        dateOfPurchase: new Date(),
        leasingCompany: 'Test Co.',
        officerName: 'Test Officer',
        officerContactNo: '0771234567',
        commissionPercentage: 5,
        totalAmount: 250000,
        balance: 150000,
        downPayment: 100000,
        regFee: 10200,
        docCharge: 5000,
        insuranceCo: 'Test Insurance',
        firstInstallment: { amount: 50000, date: new Date() },
        secondInstallment: { amount: 50000, date: new Date() },
        thirdInstallment: { amount: 50000, date: new Date() },
        chequeNo: `CHQ${i}23456`,
        chequeAmount: 100000,
        paymentType: paymentTypes[i],
        vehicleIssueDate: new Date(),
        vehicleIssueTime: '10:00 AM',
        status: 'Pending',
        notes: `Test ${paymentTypes[i]} payment`,
        discountApplied: false,
        discountAmount: 0
      };

      const mockReq = { body: paymentTypeData };
      const mockRes = {
        status: (code) => ({
          json: (data) => {
            console.log(`✅ ${paymentTypes[i]} payment coupon created`);
            return data;
          }
        })
      };

      await vehicleAllocationCouponController.createVehicleAllocationCoupon(mockReq, mockRes, () => {});
    }

    // Test 5: Final verification
    console.log('\n📝 TEST 5: FINAL VERIFICATION');
    console.log('-'.repeat(30));

    const allCoupons = await VehicleAllocationCoupon.find();
    const allSales = await SalesTransaction.find();
    const allInstallments = await InstallmentPlan.find();

    console.log(`Total Coupons: ${allCoupons.length}`);
    console.log(`Total Sales Transactions: ${allSales.length}`);
    console.log(`Total Installment Plans: ${allInstallments.length}`);

    // Check integration status
    let fullyIntegrated = 0;
    let partiallyIntegrated = 0;
    let notIntegrated = 0;

    for (const coupon of allCoupons) {
      const sales = await SalesTransaction.findOne({ relatedCouponId: coupon.couponId });
      const installment = await InstallmentPlan.findOne({ relatedCouponId: coupon.couponId });

      if (sales && installment) {
        fullyIntegrated++;
      } else if (sales || installment) {
        partiallyIntegrated++;
      } else {
        notIntegrated++;
      }
    }

    console.log(`Fully Integrated Coupons: ${fullyIntegrated}`);
    console.log(`Partially Integrated Coupons: ${partiallyIntegrated}`);
    console.log(`Not Integrated Coupons: ${notIntegrated}`);

    // Test 6: Data consistency check
    console.log('\n📝 TEST 6: DATA CONSISTENCY CHECK');
    console.log('-'.repeat(30));

    let consistencyErrors = 0;

    for (const coupon of allCoupons) {
      const sales = await SalesTransaction.findOne({ relatedCouponId: coupon.couponId });
      const installment = await InstallmentPlan.findOne({ relatedCouponId: coupon.couponId });

      if (sales) {
        if (sales.customerName !== coupon.fullName) {
          console.log(`❌ Name mismatch for coupon ${coupon.couponId}`);
          consistencyErrors++;
        }
        if (sales.salePrice !== coupon.totalAmount) {
          console.log(`❌ Amount mismatch for coupon ${coupon.couponId}`);
          consistencyErrors++;
        }
      }

      if (installment) {
        if (installment.customerName !== coupon.fullName) {
          console.log(`❌ Name mismatch for installment ${coupon.couponId}`);
          consistencyErrors++;
        }
        if (installment.totalAmount !== coupon.totalAmount) {
          console.log(`❌ Amount mismatch for installment ${coupon.couponId}`);
          consistencyErrors++;
        }
      }
    }

    if (consistencyErrors === 0) {
      console.log('✅ All data is consistent across systems');
    } else {
      console.log(`❌ Found ${consistencyErrors} consistency errors`);
    }

    console.log('\n🎉 COMPREHENSIVE WORKFLOW TEST COMPLETED!');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Workflow test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the comprehensive workflow test
testCompleteWorkflow(); 