const mongoose = require('mongoose');
const VehicleAllocationCoupon = require('../models/VehicleAllocationCoupon');

// Connect to MongoDB using the same connection string as the main app
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/akr-group-portal';

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

async function updateExistingCouponsForChequeReminders() {
  try {
    console.log('🔍 Finding coupons with down payments that need cheque reminder fields...');
    
    // Find all coupons that have down payments but don't have chequeReleaseDate
    const couponsToUpdate = await VehicleAllocationCoupon.find({
      downPayment: { $gt: 0 },
      $or: [
        { chequeReleaseDate: { $exists: false } },
        { downPaymentDate: { $exists: false } }
      ]
    });

    console.log(`📊 Found ${couponsToUpdate.length} coupons that need updating`);

    if (couponsToUpdate.length === 0) {
      console.log('✅ All coupons are already up to date!');
      return;
    }

    let updatedCount = 0;
    
    for (const coupon of couponsToUpdate) {
      try {
        // Set down payment date to the coupon creation date if not set
        const downPaymentDate = coupon.downPaymentDate || coupon.dateOfPurchase || coupon.createdAt || new Date();
        
        // Calculate cheque release date (4 days after down payment)
        const chequeReleaseDate = new Date(downPaymentDate);
        chequeReleaseDate.setDate(chequeReleaseDate.getDate() + 4);
        
        // Update the coupon
        await VehicleAllocationCoupon.findByIdAndUpdate(coupon._id, {
          downPaymentDate: downPaymentDate,
          chequeReleaseDate: chequeReleaseDate,
          chequeReleased: false
        });

        console.log(`✅ Updated coupon ${coupon.couponId} (${coupon.fullName})`);
        console.log(`   Down Payment: LKR ${coupon.downPayment.toLocaleString()}`);
        console.log(`   Down Payment Date: ${downPaymentDate.toLocaleDateString()}`);
        console.log(`   Cheque Release Date: ${chequeReleaseDate.toLocaleDateString()}`);
        console.log('   ---');
        
        updatedCount++;
      } catch (error) {
        console.error(`❌ Error updating coupon ${coupon.couponId}:`, error.message);
      }
    }

    console.log(`\n🎉 Successfully updated ${updatedCount} out of ${couponsToUpdate.length} coupons`);
    
    // Verify the update by checking for reminders
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const reminders = await VehicleAllocationCoupon.find({
      downPayment: { $gt: 0 },
      chequeReleaseDate: { $lte: tomorrow },
      chequeReleased: false
    }).select('couponId fullName downPayment chequeReleaseDate');

    console.log(`\n📋 Current cheque release reminders: ${reminders.length}`);
    reminders.forEach(reminder => {
      const releaseDate = new Date(reminder.chequeReleaseDate);
      const daysDiff = Math.ceil((releaseDate - today) / (1000 * 60 * 60 * 24));
      const status = daysDiff < 0 ? 'OVERDUE' : daysDiff === 0 ? 'DUE TODAY' : 'UPCOMING';
      console.log(`   ${reminder.couponId} - ${reminder.fullName} - LKR ${reminder.downPayment.toLocaleString()} - ${status} (${daysDiff} days)`);
    });

  } catch (error) {
    console.error('❌ Error updating coupons:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the script
updateExistingCouponsForChequeReminders(); 