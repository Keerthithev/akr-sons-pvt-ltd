const Vehicle = require('../models/Vehicle.cjs');
const Company = require('../models/Company.cjs');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const tmp = require('tmp');
const fs = require('fs');

// Add this log before cloudinary.config

// Configure Cloudinary (ensure your env vars are set)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer setup for single PDF upload
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDF files are allowed!'));
  },
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
});

// Helper to upload PDF buffer to Cloudinary
async function uploadPdfToCloudinary(buffer, filename) {
  console.log('Starting Cloudinary PDF upload (temp file)...');
  const tmpFile = tmp.fileSync({ postfix: '.pdf' });
  fs.writeFileSync(tmpFile.name, buffer);
  try {
    const result = await cloudinary.uploader.upload(
      tmpFile.name,
      { resource_type: 'auto', folder: 'vehicle-brochures', public_id: filename.replace(/\.[^/.]+$/, '') }
    );
    console.log('Cloudinary PDF upload success:', result);
    return result.secure_url;
  } catch (error) {
    console.error('Cloudinary PDF upload error:', error);
    throw error;
  } finally {
    tmpFile.removeCallback();
  }
}

// Export the upload middleware for use in routes
exports.uploadBrochure = upload.single('brochure');

// List all vehicles for a company
exports.listVehicles = async (req, res, next) => {
  try {
    const vehicles = await Vehicle.find({ company: req.params.companyId });
    res.json(vehicles);
  } catch (err) {
    next(err);
  }
};

// Add a vehicle to a company
exports.addVehicle = async (req, res, next) => {
  try {
    // Parse JSON fields if sent as strings (FormData)
    if (typeof req.body.colors === 'string') req.body.colors = JSON.parse(req.body.colors);
    if (typeof req.body.features === 'string') req.body.features = JSON.parse(req.body.features);
    if (typeof req.body.specs === 'string') req.body.specs = JSON.parse(req.body.specs);
    if (typeof req.body.galleryImages === 'string') req.body.galleryImages = JSON.parse(req.body.galleryImages);
    if (typeof req.body.faqs === 'string') req.body.faqs = JSON.parse(req.body.faqs);
    if (typeof req.body.variants === 'string') req.body.variants = JSON.parse(req.body.variants);

    if (req.file) {
      console.log('Received PDF file:', req.file.originalname, req.file.mimetype, req.file.size);
    }

    const company = await Company.findById(req.params.companyId);
    if (!company) return res.status(404).json({ message: 'Company not found' });

    // Validate colors
    if (req.body.colors) {
      if (!Array.isArray(req.body.colors)) {
        return res.status(400).json({ message: 'Colors must be an array' });
      }
      for (const color of req.body.colors) {
        if (!color.name || !color.hex || !Array.isArray(color.images) || color.images.length === 0 || !color.images.every(img => typeof img === 'string')) {
          return res.status(400).json({ message: 'Each color must have name, hex, and images (array of strings, at least one)' });
        }
      }
    }
    // Validate rating
    if (req.body.rating && typeof req.body.rating !== 'number') {
      return res.status(400).json({ message: 'Rating must be a number' });
    }
    if (!req.body.price || isNaN(Number(req.body.price))) {
      return res.status(400).json({ message: 'Price is required and must be a number.' });
    }

    let brochureUrl = req.body.brochure || '';
    if (req.file) {
      // Upload PDF to Cloudinary
      try {
        brochureUrl = await uploadPdfToCloudinary(req.file.buffer, req.file.originalname);
      } catch (err) {
        return res.status(500).json({ message: 'Failed to upload brochure PDF', error: err.message });
      }
    }

    const vehicleData = {
      ...req.body,
      price: Number(req.body.price),
      galleryImages: req.body.galleryImages || [],
      specs: req.body.specs || {},
      brochure: brochureUrl,
    };

    const vehicle = new Vehicle(vehicleData);
    await vehicle.save();
    company.vehicles.push(vehicle._id);
    await company.save();
    res.status(201).json(vehicle);
  } catch (err) {
    next(err);
  }
};

// Get vehicle details
exports.getVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.vehicleId);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    res.json(vehicle);
  } catch (err) {
    next(err);
  }
}; 

// Update vehicle details
exports.updateVehicle = async (req, res, next) => {
  try {
    // Parse JSON fields if sent as strings (FormData)
    if (typeof req.body.colors === 'string') req.body.colors = JSON.parse(req.body.colors);
    if (typeof req.body.features === 'string') req.body.features = JSON.parse(req.body.features);
    if (typeof req.body.specs === 'string') req.body.specs = JSON.parse(req.body.specs);
    if (typeof req.body.galleryImages === 'string') req.body.galleryImages = JSON.parse(req.body.galleryImages);
    if (typeof req.body.faqs === 'string') req.body.faqs = JSON.parse(req.body.faqs);
    if (typeof req.body.variants === 'string') req.body.variants = JSON.parse(req.body.variants);

    if (req.file) {
      console.log('Received PDF file:', req.file.originalname, req.file.mimetype, req.file.size);
    }
    // Debug log for brochure
    console.log('Received brochure in PATCH:', req.body.brochure);
    // Validate colors
    if (req.body.colors) {
      if (!Array.isArray(req.body.colors)) {
        return res.status(400).json({ message: 'Colors must be an array' });
      }
      for (const color of req.body.colors) {
        if (!color.name || !color.hex || !Array.isArray(color.images) || color.images.length === 0 || !color.images.every(img => typeof img === 'string')) {
          return res.status(400).json({ message: 'Each color must have name, hex, and images (array of strings, at least one)' });
        }
      }
    }
    // Validate rating
    if (req.body.rating && typeof req.body.rating !== 'number') {
      return res.status(400).json({ message: 'Rating must be a number' });
    }
    if (!req.body.price || isNaN(Number(req.body.price))) {
      return res.status(400).json({ message: 'Price is required and must be a number.' });
    }
    // If specs is an array, convert to object
    if (Array.isArray(req.body.specs)) {
      const specsObj = {};
      req.body.specs.forEach(s => {
        if (s.key && s.value) specsObj[s.key] = s.value;
      });
      req.body.specs = specsObj;
    }

    let brochureUrl = req.body.brochure || undefined;
    if (req.file) {
      // Upload PDF to Cloudinary
      try {
        brochureUrl = await uploadPdfToCloudinary(req.file.buffer, req.file.originalname);
      } catch (err) {
        return res.status(500).json({ message: 'Failed to upload brochure PDF', error: err.message });
      }
    }
    const updateData = { ...req.body };
    if (brochureUrl !== undefined) updateData.brochure = brochureUrl;

    const vehicle = await Vehicle.findByIdAndUpdate(
      req.params.vehicleId,
      { $set: updateData },
      { new: true, runValidators: true }
    );
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    res.json(vehicle);
  } catch (err) {
    next(err);
  }
};

// Delete vehicle
exports.deleteVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.vehicleId);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    // Remove vehicle reference from company
    await Company.updateOne(
      { _id: vehicle.company },
      { $pull: { vehicles: vehicle._id } }
    );
    res.json({ message: 'Vehicle deleted successfully' });
  } catch (err) {
    next(err);
  }
}; 

// List all vehicles (no company filter)
exports.listAllVehicles = async (req, res, next) => {
  try {
    const vehicles = await Vehicle.find();
    res.json(vehicles);
  } catch (err) {
    next(err);
  }
}; 

// Update only the 'available' status of a vehicle
exports.updateVehicleAvailability = async (req, res, next) => {
  try {
    if (typeof req.body.available !== 'boolean') {
      return res.status(400).json({ message: 'Missing or invalid available field (must be boolean)' });
    }
    const vehicle = await Vehicle.findByIdAndUpdate(
      req.params.vehicleId,
      { $set: { available: req.body.available } },
      { new: true, runValidators: true }
    );
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    res.json(vehicle);
  } catch (err) {
    next(err);
  }
};

// Update stock quantity of a vehicle
exports.updateStockQuantity = async (req, res, next) => {
  try {
    const { stockQuantity } = req.body;
    
    if (typeof stockQuantity !== 'number' || stockQuantity < 0) {
      return res.status(400).json({ message: 'Stock quantity must be a non-negative number' });
    }
    
    const vehicle = await Vehicle.findByIdAndUpdate(
      req.params.vehicleId,
      { $set: { stockQuantity } },
      { new: true, runValidators: true }
    );
    
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    res.json(vehicle);
  } catch (err) {
    next(err);
  }
}; 