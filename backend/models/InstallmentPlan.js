const mongoose = require('mongoose');

const installmentPlanSchema = new mongoose.Schema({
  installmentId: { type: String, required: true, unique: true },
  customerName: { type: String, required: true },
  customerPhone: { type: String, default: '' },
  customerAddress: { type: String, default: '' },
  vehicleModel: { type: String, default: '' },
  totalAmount: { type: Number, min: 0 },
  downPayment: { type: Number, min: 0 },
  balanceAmount: { type: Number, min: 0 },
  installmentAmount: { type: Number, min: 0 },
  numberOfInstallments: { type: Number, min: 1 },
  startDate: { type: Date },
  endDate: { type: Date },
  status: { 
    type: String, 
    enum: ['Active', 'Completed', 'Overdue', 'Defaulted'], 
    default: 'Active' 
  },
  notes: { type: String, default: '' },
  relatedCouponId: { type: String, default: '' }
}, { timestamps: true });

installmentPlanSchema.index({ installmentId: 1 });
installmentPlanSchema.index({ customerName: 1 });
installmentPlanSchema.index({ status: 1 });
installmentPlanSchema.index({ startDate: 1 });
installmentPlanSchema.index({ relatedCouponId: 1 });

module.exports = mongoose.model('InstallmentPlan', installmentPlanSchema); 