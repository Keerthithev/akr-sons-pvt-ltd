const mongoose = require('mongoose');

const additionalInfoSchema = new mongoose.Schema({
  bikeId: { 
    type: String, 
    required: true 
  },
  customerId: { 
    type: String, 
    required: true 
  },
  insuranceProvider: { 
    type: String, 
    default: '' 
  },
  insuranceExpiryDate: { 
    type: Date 
  },
  registrationStatus: { 
    type: String, 
    enum: ['Registered', 'Pending', 'Expired', 'Not Required'],
    default: 'Pending'
  },
  bikeDeliveryStatus: { 
    type: String, 
    enum: ['Delivered', 'Pending', 'In Transit', 'Ready for Pickup', 'Cancelled'],
    default: 'Pending'
  },
  customerFeedback: { 
    type: String, 
    default: '' 
  },
  customerRating: { 
    type: Number, 
    min: 1, 
    max: 5,
    default: 0
  },
  remarks: { 
    type: String, 
    default: '' 
  },
  notes: { 
    type: String, 
    default: '' 
  },
  additionalDocuments: [{
    documentType: String,
    documentNumber: String,
    issueDate: Date,
    expiryDate: Date,
    status: {
      type: String,
      enum: ['Valid', 'Expired', 'Pending'],
      default: 'Valid'
    }
  }],
  specialRequirements: { 
    type: String, 
    default: '' 
  },
  followUpDate: { 
    type: Date 
  },
  followUpNotes: { 
    type: String, 
    default: '' 
  }
}, { 
  timestamps: true 
});

// Create indexes for better query performance
additionalInfoSchema.index({ bikeId: 1 });
additionalInfoSchema.index({ customerId: 1 });
additionalInfoSchema.index({ registrationStatus: 1 });
additionalInfoSchema.index({ bikeDeliveryStatus: 1 });
additionalInfoSchema.index({ insuranceExpiryDate: 1 });

module.exports = mongoose.model('AdditionalInfo', additionalInfoSchema); 