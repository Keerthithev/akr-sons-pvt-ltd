const mongoose = require('mongoose');
const VehicleAllocationCoupon = require('../models/VehicleAllocationCoupon');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/akr-sons', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function fixChequeReleasedDate() {
  try {
    console.log('🔧 Starting to fix chequeReleasedDate for existing coupons...');
    
    // Find all coupons that have chequeReleased: true but no chequeReleasedDate
    const couponsToFix = await VehicleAllocationCoupon.find({
      chequeReleased: true,
      $or: [
        { chequeReleasedDate: { $exists: false } },
        { chequeReleasedDate: null }
      ]
    });
    
    console.log(`📊 Found ${couponsToFix.length} coupons that need fixing`);
    
    if (couponsToFix.length === 0) {
      console.log('✅ No coupons need fixing. All are up to date!');
      return;
    }
    
    // Update each coupon
    for (const coupon of couponsToFix) {
      console.log(`🔄 Fixing coupon ${coupon.couponId}...`);
      
      // Use downPaymentDate + 4 days as the default release date if available
      let releaseDate = new Date();
      if (coupon.downPaymentDate) {
        releaseDate = new Date(coupon.downPaymentDate);
        releaseDate.setDate(releaseDate.getDate() + 4);
      }
      
      await VehicleAllocationCoupon.findByIdAndUpdate(coupon._id, {
        chequeReleasedDate: releaseDate
      });
      
      console.log(`✅ Fixed coupon ${coupon.couponId} with release date: ${releaseDate.toLocaleDateString()}`);
    }
    
    console.log('🎉 Successfully fixed all coupons!');
    
  } catch (error) {
    console.error('❌ Error fixing chequeReleasedDate:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the script
fixChequeReleasedDate(); 