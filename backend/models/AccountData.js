const mongoose = require('mongoose');

const accountDataSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  details: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  model: {
    type: String,
    default: ''
  },
  remarks: {
    type: String,
    default: ''
  },
  depositSlipImage: {
    type: String,
    default: ''
  },
  actualAmount: {
    type: Number,
    default: 0
  },
  depositedAmount: {
    type: Number,
    default: 0
  },
  relatedCouponId: {
    type: String,
    default: ''
  },
  depositedToBank: {
    type: Boolean,
    default: false
  },
  bankDepositDate: {
    type: Date
  }
}, {
  timestamps: true
});

// Create indexes for better query performance
accountDataSchema.index({ date: 1 });
accountDataSchema.index({ name: 1 });
accountDataSchema.index({ details: 1 });

module.exports = mongoose.model('AccountData', accountDataSchema); 