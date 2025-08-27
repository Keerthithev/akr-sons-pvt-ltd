const mongoose = require('mongoose');

const advancedCustomerSchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: true,
    trim: true
  },
  contactNo: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  address: {
    type: String,
    trim: true
  },
  bikeModel: {
    type: String,
    required: true,
    trim: true
  },
  bikeColor: {
    type: String,
    required: true,
    trim: true
  },
  advanceAmount: {
    type: Number,
    required: false,
    min: 0,
    default: 0
  },
  preBookingDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  expectedDeliveryDate: {
    type: Date
  },
  notes: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Cancelled', 'Delivered'],
    default: 'Pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better query performance
advancedCustomerSchema.index({ customerName: 1, bikeModel: 1, status: 1 });
advancedCustomerSchema.index({ preBookingDate: -1 });

module.exports = mongoose.model('AdvancedCustomer', advancedCustomerSchema); 