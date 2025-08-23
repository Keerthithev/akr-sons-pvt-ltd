const mongoose = require('mongoose');
const VehicleAllocationCoupon = require('../models/VehicleAllocationCoupon.js');
require('dotenv').config();

// Test payment calculation logic
function testPaymentCalculation() {
  console.log('=== Testing New Payment Calculation Logic ===\n');
  
  // Test data
  const basePrice = 500000; // Bike price
  const advancePayment = 100000;
  const regFee = 15000;
  const docCharge = 5000;
  const insuranceCo = 10000;
  const discountAmount = 0;
  const interestAmount = 25000; // For AKR leasing
  
  console.log('Base Values:');
  console.log(`- Bike Price: LKR ${basePrice.toLocaleString()}`);
  console.log(`- Advance Payment: LKR ${advancePayment.toLocaleString()}`);
  console.log(`- Registration Fee: LKR ${regFee.toLocaleString()}`);
  console.log(`- Doc Charge: LKR ${docCharge.toLocaleString()}`);
  console.log(`- Insurance: LKR ${insuranceCo.toLocaleString()}`);
  console.log(`- Interest Amount: LKR ${interestAmount.toLocaleString()}`);
  console.log(`- Discount Amount: LKR ${discountAmount.toLocaleString()}\n`);
  
  // Test 1: Full Payment
  console.log('1. FULL PAYMENT:');
  const fullPaymentTotal = basePrice + regFee + docCharge + insuranceCo - discountAmount;
  const fullPaymentDownPayment = advancePayment + regFee;
  const fullPaymentBalance = fullPaymentTotal - fullPaymentDownPayment;
  
  console.log(`   Total Amount: ${basePrice} + ${regFee} + ${docCharge} + ${insuranceCo} - ${discountAmount} = LKR ${fullPaymentTotal.toLocaleString()}`);
  console.log(`   Down Payment: ${advancePayment} + ${regFee} = LKR ${fullPaymentDownPayment.toLocaleString()}`);
  console.log(`   Balance: ${fullPaymentTotal} - ${fullPaymentDownPayment} = LKR ${fullPaymentBalance.toLocaleString()}`);
  console.log(`   Installments: None (Full Payment)\n`);
  
  // Test 2: Leasing via AKR
  console.log('2. LEASING VIA AKR:');
  const akrTotal = basePrice + regFee + docCharge + insuranceCo + interestAmount - discountAmount;
  const akrDownPayment = advancePayment + regFee + insuranceCo + docCharge;
  const akrBalance = akrTotal - akrDownPayment;
  const akrInstallmentAmount = akrBalance / 3;
  
  console.log(`   Total Amount: ${basePrice} + ${regFee} + ${docCharge} + ${insuranceCo} + ${interestAmount} - ${discountAmount} = LKR ${akrTotal.toLocaleString()}`);
  console.log(`   Down Payment: ${advancePayment} + ${regFee} + ${insuranceCo} + ${docCharge} = LKR ${akrDownPayment.toLocaleString()}`);
  console.log(`   Balance: ${akrTotal} - ${akrDownPayment} = LKR ${akrBalance.toLocaleString()}`);
  console.log(`   Installment Amount: ${akrBalance} ÷ 3 = LKR ${akrInstallmentAmount.toLocaleString()} each\n`);
  
  // Test 3: Leasing via Other Company
  console.log('3. LEASING VIA OTHER COMPANY:');
  const otherTotal = basePrice + regFee + docCharge + insuranceCo - discountAmount;
  const otherDownPayment = advancePayment + regFee + insuranceCo + docCharge;
  const otherBalance = otherTotal - otherDownPayment;
  
  console.log(`   Total Amount: ${basePrice} + ${regFee} + ${docCharge} + ${insuranceCo} - ${discountAmount} = LKR ${otherTotal.toLocaleString()}`);
  console.log(`   Down Payment: ${advancePayment} + ${regFee} + ${insuranceCo} + ${docCharge} = LKR ${otherDownPayment.toLocaleString()}`);
  console.log(`   Balance: ${otherTotal} - ${otherDownPayment} = LKR ${otherBalance.toLocaleString()}`);
  console.log(`   Installments: None (Handled by other company)\n`);
  
  console.log('=== Test Summary ===');
  console.log(`Full Payment - Down Payment: LKR ${fullPaymentDownPayment.toLocaleString()}`);
  console.log(`AKR Leasing - Down Payment: LKR ${akrDownPayment.toLocaleString()}`);
  console.log(`Other Company - Down Payment: LKR ${otherDownPayment.toLocaleString()}`);
}

// Connect to MongoDB and run test
async function runTest() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connected to MongoDB');
    testPaymentCalculation();
    
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

runTest(); 