const mongoose = require('mongoose');

const serviceWarrantySchema = new mongoose.Schema({
  serviceId: { 
    type: String, 
    required: true, 
    unique: true 
  },
  bikeId: { 
    type: String, 
    required: true 
  },
  customerId: { 
    type: String, 
    required: true 
  },
  serviceDate: { 
    type: Date, 
    required: true 
  },
  typeOfService: { 
    type: String, 
    required: true,
    enum: ['Regular Service', 'Warranty Service', 'Emergency Service', 'Preventive Maintenance', 'Repair', 'Inspection']
  },
  description: { 
    type: String, 
    required: true 
  },
  serviceCost: { 
    type: Number, 
    required: true,
    min: 0
  },
  technicianName: { 
    type: String, 
    required: true 
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Completed', 'Cancelled'],
    default: 'Pending'
  },
  warrantyExpiryDate: {
    type: Date
  },
  warrantyType: {
    type: String,
    enum: ['Standard', 'Extended', 'Premium', 'None'],
    default: 'Standard'
  },
  notes: {
    type: String,
    default: ''
  }
}, { 
  timestamps: true 
});

// Create indexes for better query performance
serviceWarrantySchema.index({ serviceId: 1 });
serviceWarrantySchema.index({ bikeId: 1 });
serviceWarrantySchema.index({ customerId: 1 });
serviceWarrantySchema.index({ serviceDate: 1 });
serviceWarrantySchema.index({ typeOfService: 1 });
serviceWarrantySchema.index({ status: 1 });

module.exports = mongoose.model('ServiceWarranty', serviceWarrantySchema); 