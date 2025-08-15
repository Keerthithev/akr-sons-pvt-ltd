const Supplier = require('../models/Supplier');

// Generate the next supplierId in the format 'SUP-001', 'SUP-002', ...
async function generateSupplierId() {
  const latest = await Supplier.findOne({ supplierId: /^SUP-\d+$/i })
    .sort({ createdAt: -1 })
    .lean();
  let nextNum = 1;
  if (latest && latest.supplierId) {
    const match = latest.supplierId.match(/SUP-(\d+)/i);
    if (match) {
      nextNum = parseInt(match[1], 10) + 1;
    }
  }
  const padded = String(nextNum).padStart(3, '0');
  return `SUP-${padded}`;
}

// Create a new supplier
exports.createSupplier = async (req, res, next) => {
  try {
    const supplierId = await generateSupplierId();
    const supplier = new Supplier({ ...req.body, supplierId });
    await supplier.save();
    res.status(201).json(supplier);
  } catch (err) {
    next(err);
  }
};

// Get all suppliers with pagination and search
exports.getAllSuppliers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '', status = '' } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    
    if (search) {
      query.$or = [
        { supplierName: { $regex: search, $options: 'i' } },
        { supplierId: { $regex: search, $options: 'i' } },
        { contactPerson: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status) {
      query.status = status;
    }

    const suppliers = await Supplier.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Supplier.countDocuments(query);

    res.json({
      suppliers,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    next(err);
  }
};

// Get supplier by ID
exports.getSupplierById = async (req, res, next) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }
    res.json(supplier);
  } catch (err) {
    next(err);
  }
};

// Update supplier
exports.updateSupplier = async (req, res, next) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }
    res.json(supplier);
  } catch (err) {
    next(err);
  }
};

// Delete supplier
exports.deleteSupplier = async (req, res, next) => {
  try {
    const supplier = await Supplier.findByIdAndDelete(req.params.id);
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }
    res.json({ message: 'Supplier deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// Get supplier statistics
exports.getSupplierStats = async (req, res, next) => {
  try {
    const totalSuppliers = await Supplier.countDocuments();
    const activeSuppliers = await Supplier.countDocuments({ status: 'Active' });
    const inactiveSuppliers = await Supplier.countDocuments({ status: 'Inactive' });
    const suspendedSuppliers = await Supplier.countDocuments({ status: 'Suspended' });
    
    const totalBikesSupplied = await Supplier.aggregate([
      { $group: { _id: null, total: { $sum: '$totalSuppliedBikes' } } }
    ]);

    const recentSuppliers = await Supplier.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('supplierName contactPerson createdAt');

    const topSuppliers = await Supplier.find()
      .sort({ totalSuppliedBikes: -1 })
      .limit(5)
      .select('supplierName totalSuppliedBikes');

    res.json({
      overall: {
        totalSuppliers,
        activeSuppliers,
        inactiveSuppliers,
        suspendedSuppliers,
        totalBikesSupplied: totalBikesSupplied[0]?.total || 0
      },
      recentSuppliers,
      topSuppliers
    });
  } catch (err) {
    next(err);
  }
}; 