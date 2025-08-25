const mongoose = require('mongoose');
const VehicleAllocationCoupon = require('../models/VehicleAllocationCoupon');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/akr-sons', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function fixIncorrectChequeRelease() {
  try {
    console.log('Starting to fix incorrect cheque release status...');
    
    // Find the specific record for Banusha Balasubramaniyam
    const record = await VehicleAllocationCoupon.findOne({
      fullName: 'Banusha Balasubramaniyam',
      paymentMethod: 'Leasing via Other Company',
      chequeReleased: true
    });
    
    if (!record) {
      console.log('Record not found for Banusha Balasubramaniyam');
      return;
    }
    
    console.log('Found record:', {
      couponId: record.couponId,
      fullName: record.fullName,
      paymentMethod: record.paymentMethod,
      chequeReleased: record.chequeReleased,
      chequeReleaseDate: record.chequeReleaseDate
    });
    
    // Reset the cheque release status
    await VehicleAllocationCoupon.findByIdAndUpdate(record._id, {
      chequeReleased: false,
      chequeReleaseDate: null
    });
    
    console.log('Successfully reset cheque release status for Banusha Balasubramaniyam');
    console.log('The record is now ready for proper cheque release');
    
  } catch (error) {
    console.error('Error fixing incorrect cheque release:', error);
  } finally {
    mongoose.connection.close();
  }
}

fixIncorrectChequeRelease(); 