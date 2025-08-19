const mongoose = require('mongoose');

const bankDepositSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  depositerName: { type: String, default: '' },
  accountNumber: { type: String, default: '' },
  accountName: { type: String, default: '' },
  purpose: { type: String, default: '' },
  quantity: { type: Number, default: 0 },
  payment: { type: Number, required: true },
  slipImage: { type: String, default: '' }
}, { timestamps: true });

bankDepositSchema.index({ date: -1 });
bankDepositSchema.index({ depositerName: 1 });
bankDepositSchema.index({ accountName: 1 });
bankDepositSchema.index({ purpose: 1 });

module.exports = mongoose.model('BankDeposit', bankDepositSchema); 