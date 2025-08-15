const ServiceWarranty = require('../models/ServiceWarranty');

// Generate the next serviceId in the format 'SVC-001', 'SVC-002', ...
async function generateServiceId() {
  const latest = await ServiceWarranty.findOne({ serviceId: /^SVC-\d+$/i })
    .sort({ createdAt: -1 })
    .lean();
  let nextNum = 1;
  if (latest && latest.serviceId) {
    const match = latest.serviceId.match(/SVC-(\d+)/i);
    if (match) {
      nextNum = parseInt(match[1], 10) + 1;
    }
  }
  const padded = String(nextNum).padStart(3, '0');
  return `SVC-${padded}`;
}

// Create a new service warranty record
exports.createServiceWarranty = async (req, res, next) => {
  try {
    const serviceId = await generateServiceId();
    const serviceWarranty = new ServiceWarranty({ ...req.body, serviceId });
    await serviceWarranty.save();
    res.status(201).json(serviceWarranty);
  } catch (err) {
    next(err);
  }
};

// Get all service warranty records with pagination and search
exports.getAllServiceWarranty = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '', typeOfService = '', status = '' } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    
    if (search) {
      query.$or = [
        { serviceId: { $regex: search, $options: 'i' } },
        { bikeId: { $regex: search, $options: 'i' } },
        { customerId: { $regex: search, $options: 'i' } },
        { technicianName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (typeOfService) {
      query.typeOfService = typeOfService;
    }
    
    if (status) {
      query.status = status;
    }

    const serviceWarranty = await ServiceWarranty.find(query)
      .sort({ serviceDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await ServiceWarranty.countDocuments(query);

    res.json({
      serviceWarranty,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    next(err);
  }
};

// Get service warranty by ID
exports.getServiceWarrantyById = async (req, res, next) => {
  try {
    const serviceWarranty = await ServiceWarranty.findById(req.params.id);
    if (!serviceWarranty) {
      return res.status(404).json({ message: 'Service warranty record not found' });
    }
    res.json(serviceWarranty);
  } catch (err) {
    next(err);
  }
};

// Update service warranty
exports.updateServiceWarranty = async (req, res, next) => {
  try {
    const serviceWarranty = await ServiceWarranty.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!serviceWarranty) {
      return res.status(404).json({ message: 'Service warranty record not found' });
    }
    res.json(serviceWarranty);
  } catch (err) {
    next(err);
  }
};

// Delete service warranty
exports.deleteServiceWarranty = async (req, res, next) => {
  try {
    const serviceWarranty = await ServiceWarranty.findByIdAndDelete(req.params.id);
    if (!serviceWarranty) {
      return res.status(404).json({ message: 'Service warranty record not found' });
    }
    res.json({ message: 'Service warranty record deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// Get service warranty statistics
exports.getServiceWarrantyStats = async (req, res, next) => {
  try {
    const totalServices = await ServiceWarranty.countDocuments();
    const pendingServices = await ServiceWarranty.countDocuments({ status: 'Pending' });
    const inProgressServices = await ServiceWarranty.countDocuments({ status: 'In Progress' });
    const completedServices = await ServiceWarranty.countDocuments({ status: 'Completed' });
    const cancelledServices = await ServiceWarranty.countDocuments({ status: 'Cancelled' });
    
    const totalServiceCost = await ServiceWarranty.aggregate([
      { $group: { _id: null, total: { $sum: '$serviceCost' } } }
    ]);

    const warrantyServices = await ServiceWarranty.countDocuments({ typeOfService: 'Warranty Service' });
    const regularServices = await ServiceWarranty.countDocuments({ typeOfService: 'Regular Service' });

    const recentServices = await ServiceWarranty.find()
      .sort({ serviceDate: -1 })
      .limit(5)
      .select('serviceId bikeId customerId serviceDate typeOfService status');

    const topTechnicians = await ServiceWarranty.aggregate([
      { $group: { _id: '$technicianName', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      overall: {
        totalServices,
        pendingServices,
        inProgressServices,
        completedServices,
        cancelledServices,
        totalServiceCost: totalServiceCost[0]?.total || 0,
        warrantyServices,
        regularServices
      },
      recentServices,
      topTechnicians
    });
  } catch (err) {
    next(err);
  }
}; 