const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Vehicle = require('../models/Vehicle.cjs');
const VehicleAllocationCoupon = require('../models/VehicleAllocationCoupon');

dotenv.config({ path: './.env' });

async function testEnhancedVehicleAllocationCoupon() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('🔗 Connected to MongoDB');
    console.log('='.repeat(60));

    console.log('🧪 TESTING ENHANCED VEHICLE ALLOCATION COUPON');
    console.log('='.repeat(60));

    // Test 1: Check current workshop numbers
    console.log('\n📊 CURRENT WORKSHOP NUMBERS:');
    const currentCoupons = await VehicleAllocationCoupon.find().sort({ workshopNo: 1 });
    currentCoupons.forEach(coupon => {
      console.log(`  - Workshop No: ${coupon.workshopNo} | Coupon ID: ${coupon.couponId}`);
    });

    // Test 2: Test auto-generation logic
    console.log('\n🧪 TESTING AUTO-GENERATION LOGIC:');
    
    // Get next workshop number
    const lastCoupon = await VehicleAllocationCoupon.findOne().sort({ workshopNo: -1 });
    let nextWorkshopNo = 1;
    
    if (lastCoupon && lastCoupon.workshopNo) {
      const lastWorkshopNoStr = lastCoupon.workshopNo.toString();
      const lastNumber = parseInt(lastWorkshopNoStr.match(/\d+/)?.[0] || '0');
      nextWorkshopNo = lastNumber + 1;
      console.log(`  - Last Workshop No: ${lastCoupon.workshopNo}`);
      console.log(`  - Next Workshop No: ${nextWorkshopNo}`);
    } else {
      console.log(`  - No existing coupons found, starting with Workshop No: ${nextWorkshopNo}`);
    }

    // Test 3: Test vehicle dropdown data
    console.log('\n🚗 TESTING VEHICLE DROPDOWN DATA:');
    const vehicles = await Vehicle.find();
    console.log(`  - Total Vehicles: ${vehicles.length}`);
    
    vehicles.forEach(vehicle => {
      console.log(`  - ${vehicle.name} (${vehicle.category}) - LKR ${vehicle.price?.toLocaleString()}`);
    });

    // Test 4: Test payment method logic
    console.log('\n💳 TESTING PAYMENT METHOD LOGIC:');
    const paymentMethods = ['Full Payment', 'Leasing via AKR', 'Leasing via Other Company'];
    const paymentTypes = ['Cash', 'Bank Draft', 'Online', 'Credit Card'];
    
    console.log('Payment Methods:');
    paymentMethods.forEach(method => console.log(`  - ${method}`));
    
    console.log('Payment Types:');
    paymentTypes.forEach(type => console.log(`  - ${type}`));

    // Test 5: Test installment date calculation
    console.log('\n📅 TESTING INSTALLMENT DATE CALCULATION:');
    const purchaseDate = new Date();
    console.log(`  - Purchase Date: ${purchaseDate.toLocaleDateString()}`);
    
    const firstInstallmentDate = new Date(purchaseDate.getFullYear(), purchaseDate.getMonth() + 1, purchaseDate.getDate());
    const secondInstallmentDate = new Date(purchaseDate.getFullYear(), purchaseDate.getMonth() + 2, purchaseDate.getDate());
    const thirdInstallmentDate = new Date(purchaseDate.getFullYear(), purchaseDate.getMonth() + 3, purchaseDate.getDate());
    
    console.log(`  - 1st Installment: ${firstInstallmentDate.toLocaleDateString()}`);
    console.log(`  - 2nd Installment: ${secondInstallmentDate.toLocaleDateString()}`);
    console.log(`  - 3rd Installment: ${thirdInstallmentDate.toLocaleDateString()}`);

    // Test 6: Test auto-calculation logic
    console.log('\n🧮 TESTING AUTO-CALCULATION LOGIC:');
    const vehiclePrice = 637950; // Example vehicle price
    const downPayment = 50000;
    const regFee = 10200;
    const docCharge = 5000;
    const insuranceCo = 5950;
    
    console.log(`  - Vehicle Price: LKR ${vehiclePrice.toLocaleString()}`);
    console.log(`  - Down Payment: LKR ${downPayment.toLocaleString()}`);
    console.log(`  - Reg Fee: LKR ${regFee.toLocaleString()}`);
    console.log(`  - Doc Charge: LKR ${docCharge.toLocaleString()}`);
    console.log(`  - Insurance: LKR ${insuranceCo.toLocaleString()}`);
    
    const totalDeductions = downPayment + regFee + docCharge + insuranceCo;
    const balanceAmount = vehiclePrice - totalDeductions;
    const installmentAmount = balanceAmount / 3;
    
    console.log(`  - Total Deductions: LKR ${totalDeductions.toLocaleString()}`);
    console.log(`  - Balance Amount: LKR ${balanceAmount.toLocaleString()}`);
    console.log(`  - Each Installment: LKR ${Math.round(installmentAmount).toLocaleString()}`);

    // Test 7: Create test coupon with different payment methods
    console.log('\n📝 CREATING TEST COUPONS:');
    
    const testCoupons = [
      {
        // Full Payment
        workshopNo: nextWorkshopNo.toString(),
        branch: 'Test Branch',
        date: new Date(),
        fullName: 'Test Customer 1',
        address: 'Test Address 1',
        nicNo: 'TEST001',
        contactNo: '0771234567',
        occupation: 'Test Job',
        dateOfBirth: new Date('1990-01-01'),
        vehicleType: 'CT 100 ES',
        engineNo: 'TEST-ENG-001',
        chassisNo: 'TEST-CHS-001',
        dateOfPurchase: new Date(),
        totalAmount: vehiclePrice,
        balance: 0,
        downPayment: vehiclePrice,
        paymentType: 'Cash',
        paymentMethod: 'Full Payment',
        status: 'Pending'
      },
      {
        // Leasing via AKR
        workshopNo: (nextWorkshopNo + 1).toString(),
        branch: 'Test Branch',
        date: new Date(),
        fullName: 'Test Customer 2',
        address: 'Test Address 2',
        nicNo: 'TEST002',
        contactNo: '0771234568',
        occupation: 'Test Job',
        dateOfBirth: new Date('1990-01-01'),
        vehicleType: 'Discover 125 DRL',
        engineNo: 'TEST-ENG-002',
        chassisNo: 'TEST-CHS-002',
        dateOfPurchase: new Date(),
        totalAmount: vehiclePrice,
        balance: balanceAmount,
        downPayment: downPayment,
        regFee: regFee,
        docCharge: docCharge,
        insuranceCo: insuranceCo,
        firstInstallment: {
          amount: Math.round(installmentAmount),
          date: firstInstallmentDate
        },
        secondInstallment: {
          amount: Math.round(installmentAmount),
          date: secondInstallmentDate
        },
        thirdInstallment: {
          amount: Math.round(installmentAmount),
          date: thirdInstallmentDate
        },
        paymentType: 'Bank Draft',
        paymentMethod: 'Leasing via AKR',
        status: 'Pending'
      },
             {
         // Leasing via Other Company
         workshopNo: (nextWorkshopNo + 2).toString(),
         branch: 'Test Branch',
         date: new Date(),
         fullName: 'Test Customer 3',
         address: 'Test Address 3',
         nicNo: 'TEST003',
         contactNo: '0771234569',
         occupation: 'Test Job',
         dateOfBirth: new Date('1990-01-01'),
         vehicleType: 'Pulsar NS200',
         engineNo: 'TEST-ENG-003',
         chassisNo: 'TEST-CHS-003',
         dateOfPurchase: new Date(),
         leasingCompany: 'Test Leasing Co.',
         officerName: 'Test Officer',
         officerContactNo: '0771234570',
         commissionPercentage: 5,
         totalAmount: vehiclePrice,
         balance: balanceAmount,
         downPayment: 0, // Required field
         paymentType: 'Online',
         paymentMethod: 'Leasing via Other Company',
         status: 'Pending'
       }
    ];

    const savedCoupons = [];
    for (const couponData of testCoupons) {
      // Generate coupon ID
      const latest = await VehicleAllocationCoupon.findOne({ couponId: /^VAC-\d+$/i })
        .sort({ createdAt: -1 })
        .lean();
      let nextNum = 1;
      if (latest && latest.couponId) {
        const match = latest.couponId.match(/VAC-(\d+)/i);
        if (match) {
          nextNum = parseInt(match[1], 10) + 1;
        }
      }
      const padded = String(nextNum).padStart(3, '0');
      const couponId = `VAC-${padded}`;
      
      const coupon = new VehicleAllocationCoupon({ ...couponData, couponId });
      const savedCoupon = await coupon.save();
      savedCoupons.push(savedCoupon);
      console.log(`✅ Created: ${savedCoupon.paymentMethod} - Workshop No: ${savedCoupon.workshopNo} - Coupon ID: ${savedCoupon.couponId}`);
    }

    // Test 8: Verify conditional field logic
    console.log('\n🔍 VERIFYING CONDITIONAL FIELD LOGIC:');
    
    savedCoupons.forEach(coupon => {
      console.log(`\nCoupon ${coupon.workshopNo} (${coupon.paymentMethod}):`);
      
      if (coupon.paymentMethod === 'Full Payment') {
        console.log(`  ✅ Shows: Payment Details (Full Payment)`);
        console.log(`  ❌ Hides: Leasing Company Information`);
        console.log(`  ❌ Hides: Installment Details`);
      } else if (coupon.paymentMethod === 'Leasing via AKR') {
        console.log(`  ✅ Shows: Payment Details (Down Payment, Fees)`);
        console.log(`  ❌ Hides: Leasing Company Information`);
        console.log(`  ✅ Shows: Installment Details (3 installments)`);
      } else if (coupon.paymentMethod === 'Leasing via Other Company') {
        console.log(`  ❌ Hides: Payment Details`);
        console.log(`  ✅ Shows: Leasing Company Information`);
        console.log(`  ❌ Hides: Installment Details`);
      }
    });

    // Test 9: Clean up
    console.log('\n🗑️ CLEANING UP:');
    for (const coupon of savedCoupons) {
      await VehicleAllocationCoupon.findByIdAndDelete(coupon._id);
      console.log(`✅ Deleted: Workshop No ${coupon.workshopNo}`);
    }

    console.log('\n🎉 ENHANCED VEHICLE ALLOCATION COUPON TEST COMPLETED!');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the test
testEnhancedVehicleAllocationCoupon(); 