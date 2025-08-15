const mongoose = require('mongoose');
const VehicleAllocationCoupon = require('../models/VehicleAllocationCoupon');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/akr-group-portal', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function updateVehicleAllocationCouponStatus() {
  try {
    console.log('Starting vehicle allocation coupon status update...');
    
    // Get all vehicle allocation coupons
    const coupons = await VehicleAllocationCoupon.find({});
    console.log(`Found ${coupons.length} coupons to update`);
    
    let updatedCount = 0;
    
    for (const coupon of coupons) {
      let newStatus = coupon.status;
      let needsUpdate = false;
      
      // Apply new status logic
      if (coupon.paymentMethod === 'Leasing via AKR') {
        // For "Leasing via AKR" - check if all installments are paid
        const firstPaid = (coupon.firstInstallment?.paidAmount || 0) >= (coupon.firstInstallment?.amount || 0);
        const secondPaid = (coupon.secondInstallment?.paidAmount || 0) >= (coupon.secondInstallment?.amount || 0);
        const thirdPaid = (coupon.thirdInstallment?.paidAmount || 0) >= (coupon.thirdInstallment?.amount || 0);
        
        if (firstPaid && secondPaid && thirdPaid) {
          newStatus = 'Completed';
        } else {
          newStatus = 'Pending';
        }
      } else if (coupon.paymentMethod === 'Full Payment' || coupon.paymentMethod === 'Leasing via Other Company') {
        // For "Full Payment" or "Leasing via Other Company" - automatically mark as "Completed"
        newStatus = 'Completed';
      }
      
      // Update if status changed
      if (newStatus !== coupon.status) {
        await VehicleAllocationCoupon.findByIdAndUpdate(coupon._id, { status: newStatus });
        console.log(`Updated ${coupon.couponId}: ${coupon.status} → ${newStatus} (${coupon.paymentMethod})`);
        updatedCount++;
      } else {
        console.log(`No change for ${coupon.couponId}: ${coupon.status} (${coupon.paymentMethod})`);
      }
    }
    
    console.log(`\nUpdate complete! Updated ${updatedCount} out of ${coupons.length} coupons`);
    
    // Show summary
    const summary = await VehicleAllocationCoupon.aggregate([
      {
        $group: {
          _id: { paymentMethod: '$paymentMethod', status: '$status' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.paymentMethod': 1, '_id.status': 1 }
      }
    ]);
    
    console.log('\nCurrent status distribution:');
    summary.forEach(item => {
      console.log(`${item._id.paymentMethod} - ${item._id.status}: ${item.count}`);
    });
    
  } catch (error) {
    console.error('Error updating vehicle allocation coupons:', error);
  } finally {
    mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the update
updateVehicleAllocationCouponStatus(); 