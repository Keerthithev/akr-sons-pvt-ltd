const mongoose = require('mongoose');

const salesTransactionSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: true,
    unique: true
  },
  customerName: {
    type: String,
    required: true
  },
  customerPhone: {
    type: String,
    default: ''
  },
  customerAddress: {
    type: String,
    default: ''
  },
  vehicleModel: {
    type: String,
    required: true
  },
  engineNumber: {
    type: String,
    default: ''
  },
  chassisNumber: {
    type: String,
    default: ''
  },
  saleDate: {
    type: Date,
    required: true
  },
  salePrice: {
    type: Number,
    min: 0,
    required: true
  },
  downPayment: {
    type: Number,
    min: 0,
    default: 0
  },
  balanceAmount: {
    type: Number,
    min: 0,
    default: 0
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Bank Draft', 'Online', 'Credit Card', 'Card', 'Bank Transfer', 'Cheque', 'Other']
  },
  paymentStatus: {
    type: String,
    enum: ['Paid', 'Pending', 'Partial', 'Cancelled']
  },
  salesPerson: {
    type: String,
    default: ''
  },
  notes: {
    type: String,
    default: ''
  },
  relatedCouponId: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Create indexes for better query performance
salesTransactionSchema.index({ transactionId: 1 });
salesTransactionSchema.index({ customerName: 1 });
salesTransactionSchema.index({ saleDate: 1 });
salesTransactionSchema.index({ salesPerson: 1 });
salesTransactionSchema.index({ paymentStatus: 1 });
salesTransactionSchema.index({ relatedCouponId: 1 });

module.exports = mongoose.model('SalesTransaction', salesTransactionSchema); 