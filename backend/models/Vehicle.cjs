const mongoose = require('mongoose');

const VariantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  features: [String],
  specs: {
    type: Map,
    of: String,
    default: {}
  }
}, { _id: false });

const ColorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  hex: { type: String, required: true },
  images: [{ type: String, required: true }]
}, { _id: false });

const VehicleSchema = new mongoose.Schema({
  vehicleType: { type: String, required: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  description: String,
  variants: [VariantSchema],
  features: [String],
  specs: { type: Object, default: {} },
  colors: [ColorSchema],
  price: { type: Number, required: true },
  rating: { type: Number },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  images: [String],
  galleryImages: [String],
  faqs: [{ question: String, answer: String }],
  brochure: { type: String },
  stockQuantity: { type: Number, default: 0, min: 0 },
  createdAt: { type: Date, default: Date.now },
  available: { type: Boolean, default: true }
});

// Commonly used spec keys for vehicles (should be included in frontend grouped specs input):
// - Power (optional)
// - Torque (optional)
// - Mileage (optional)
// These are stored as part of the 'specs' object for each vehicle.
module.exports = mongoose.model('Vehicle', VehicleSchema); 