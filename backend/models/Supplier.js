const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  supplierId: { 
    type: String, 
    required: true, 
    unique: true 
  },
  supplierName: { 
    type: String, 
    required: true 
  },
  contactPerson: { 
    type: String, 
    required: true 
  },
  phoneNo: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true 
  },
  address: { 
    type: String, 
    required: true 
  },
  lastPurchaseDate: { 
    type: Date 
  },
  totalSuppliedBikes: { 
    type: Number, 
    default: 0,
    min: 0 
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Suspended'],
    default: 'Active'
  },
  notes: {
    type: String,
    default: ''
  }
}, { 
  timestamps: true 
});

// Create indexes for better query performance
supplierSchema.index({ supplierId: 1 });
supplierSchema.index({ supplierName: 1 });
supplierSchema.index({ contactPerson: 1 });
supplierSchema.index({ email: 1 });
supplierSchema.index({ status: 1 });

module.exports = mongoose.model('Supplier', supplierSchema); 