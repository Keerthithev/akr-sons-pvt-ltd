const mongoose = require('mongoose');

const preBookingSchema = new mongoose.Schema({
  bookingId: { type: String, required: true, unique: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  nationalId: { type: String, required: true },
  address: { type: String, required: true },
  vehicleModel: { type: String, required: true },
  vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
  status: { type: String, enum: ['Pending', 'Confirmed', 'Delivered', 'Cancelled'], default: 'Pending' },
  orderDate: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PreBooking', preBookingSchema); 