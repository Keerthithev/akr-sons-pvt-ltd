const mongoose = require('mongoose');

const bikeInventorySchema = new mongoose.Schema({
  date: { type: Date, required: true },
  bikeId: { type: String, default: '' },
  branch: { type: String, default: '' },
  brand: { type: String, default: '' },
  category: { type: String, default: '' },
  model: { type: String, default: '' },
  color: { type: String, default: '' },
  dateOfPurchase: { type: Date, default: null },
  engineCapacity: { type: String, default: '' },
  fuelType: { type: String, default: '' },
  transmission: { type: String, default: '' },
  yearOfManufacture: { type: Number, default: null },
  stockQuantity: { type: Number, default: 1 },
  unitCostPrice: { type: Number, default: 0 },
  sellingPrice: { type: Number, default: 0 },
  bikeCondition: { type: String, default: '' },
  engineNo: { type: String, default: '' },
  chassisNumber: { type: String, default: '' },
  registrationNo: { type: String, default: '' }
}, { timestamps: true });

bikeInventorySchema.index({ date: -1 });
bikeInventorySchema.index({ branch: 1 });
bikeInventorySchema.index({ brand: 1 });
bikeInventorySchema.index({ category: 1 });
bikeInventorySchema.index({ model: 1 });
bikeInventorySchema.index({ bikeId: 1 });
bikeInventorySchema.index({ engineNo: 1 });
bikeInventorySchema.index({ chassisNumber: 1 });

module.exports = mongoose.model('BikeInventory', bikeInventorySchema); 