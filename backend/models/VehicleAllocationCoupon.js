const mongoose = require('mongoose');

const vehicleAllocationCouponSchema = new mongoose.Schema({
  couponId: { 
    type: String, 
    required: true, 
    unique: true 
  },
  workshopNo: { 
    type: String, 
    required: true 
  },
  branch: { 
    type: String, 
    required: true 
  },
  date: { 
    type: Date, 
    required: true 
  },
  
  // Customer Information
  fullName: { 
    type: String, 
    required: true 
  },
  address: { 
    type: String, 
    required: true 
  },
  nicNo: { 
    type: String, 
    required: true 
  },
  contactNo: { 
    type: String, 
    required: true 
  },
  occupation: { 
    type: String, 
    required: true 
  },
  dateOfBirth: { 
    type: Date, 
    required: true 
  },
  
  // Vehicle Information
  vehicleType: { 
    type: String, 
    required: true 
  },
  engineNo: { 
    type: String, 
    required: true 
  },
  chassisNo: { 
    type: String, 
    required: true 
  },
  dateOfPurchase: { 
    type: Date, 
    required: true 
  },
  
  // Leasing Company Information
  leasingCompany: { 
    type: String, 
    default: '' 
  },
  officerName: { 
    type: String, 
    default: '' 
  },
  officerContactNo: { 
    type: String, 
    default: '' 
  },
  commissionPercentage: { 
    type: Number, 
    default: 0 
  },
  totalAmount: { 
    type: Number, 
    required: true 
  },
  balance: { 
    type: Number, 
    required: true 
  },
  
  // Payment Details
  downPayment: { 
    type: Number, 
    required: true 
  },
  regFee: { 
    type: Number, 
    default: 0 
  },
  docCharge: { 
    type: Number, 
    default: 0 
  },
  insuranceCo: { 
    type: String, 
    default: '' 
  },
  
  // Installment Details
  firstInstallment: {
    amount: { type: Number, default: 0 },
    date: { type: Date },
    paidAmount: { type: Number, default: 0 },
    paidDate: { type: Date }
  },
  secondInstallment: {
    amount: { type: Number, default: 0 },
    date: { type: Date },
    paidAmount: { type: Number, default: 0 },
    paidDate: { type: Date }
  },
  thirdInstallment: {
    amount: { type: Number, default: 0 },
    date: { type: Date },
    paidAmount: { type: Number, default: 0 },
    paidDate: { type: Date }
  },
  chequeNo: { 
    type: String, 
    default: '' 
  },
  chequeAmount: { 
    type: Number, 
    default: 0 
  },
  
  // Payment Type and Method
  paymentType: { 
    type: String, 
    enum: ['Cash', 'Bank Draft', 'Online', 'Credit Card'],
    required: true 
  },
  paymentMethod: {
    type: String,
    enum: ['Full Payment', 'Leasing via AKR', 'Leasing via Other Company'],
    required: true
  },
  
  // Vehicle Issue Details
  vehicleIssueDate: { 
    type: Date 
  },
  vehicleIssueTime: { 
    type: String 
  },
  
  // Signatures
  customerSignature: { 
    type: String, 
    default: '' 
  },
  salesDealerSignature: { 
    type: String, 
    default: '' 
  },
  
  // Status
  status: {
    type: String,
    enum: ['Pending', 'Completed'],
    default: 'Pending'
  },
  
  // Additional Notes
  notes: { 
    type: String, 
    default: '' 
  },
  
  // Discount Information
  discountApplied: { 
    type: Boolean, 
    default: false 
  },
  discountAmount: { 
    type: Number, 
    default: 0 
  }
}, { 
  timestamps: true 
});

// Create indexes for better query performance
vehicleAllocationCouponSchema.index({ couponId: 1 });
vehicleAllocationCouponSchema.index({ fullName: 1 });
vehicleAllocationCouponSchema.index({ nicNo: 1 });
vehicleAllocationCouponSchema.index({ vehicleType: 1 });
vehicleAllocationCouponSchema.index({ date: 1 });
vehicleAllocationCouponSchema.index({ status: 1 });

module.exports = mongoose.model('VehicleAllocationCoupon', vehicleAllocationCouponSchema); 