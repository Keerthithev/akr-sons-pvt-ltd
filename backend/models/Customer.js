const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  nicDrivingLicense: { type: String, default: '' },
  phoneNo: { type: String, default: '' },
  address: { type: String, default: '' },
  language: { type: String, default: '' },
  occupation: { type: String, default: '' },
  dateOfPurchase: { type: Date, default: null }
}, { timestamps: true });

customerSchema.index({ fullName: 1 });
customerSchema.index({ nicDrivingLicense: 1 });
customerSchema.index({ phoneNo: 1 });
customerSchema.index({ dateOfPurchase: -1 });

module.exports = mongoose.model('Customer', customerSchema); 