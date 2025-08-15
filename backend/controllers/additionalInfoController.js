const AdditionalInfo = require('../models/AdditionalInfo');

// Create a new additional info record
exports.createAdditionalInfo = async (req, res, next) => {
  try {
    const additionalInfo = new AdditionalInfo(req.body);
    await additionalInfo.save();
    res.status(201).json(additionalInfo);
  } catch (err) {
    next(err);
  }
};

// Get all additional info records with pagination and search
exports.getAllAdditionalInfo = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '', registrationStatus = '', bikeDeliveryStatus = '' } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    
    if (search) {
      query.$or = [
        { bikeId: { $regex: search, $options: 'i' } },
        { customerId: { $regex: search, $options: 'i' } },
        { insuranceProvider: { $regex: search, $options: 'i' } },
        { customerFeedback: { $regex: search, $options: 'i' } },
        { remarks: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (registrationStatus) {
      query.registrationStatus = registrationStatus;
    }
    
    if (bikeDeliveryStatus) {
      query.bikeDeliveryStatus = bikeDeliveryStatus;
    }

    const additionalInfo = await AdditionalInfo.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await AdditionalInfo.countDocuments(query);

    res.json({
      additionalInfo,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    next(err);
  }
};

// Get additional info by ID
exports.getAdditionalInfoById = async (req, res, next) => {
  try {
    const additionalInfo = await AdditionalInfo.findById(req.params.id);
    if (!additionalInfo) {
      return res.status(404).json({ message: 'Additional info record not found' });
    }
    res.json(additionalInfo);
  } catch (err) {
    next(err);
  }
};

// Update additional info
exports.updateAdditionalInfo = async (req, res, next) => {
  try {
    const additionalInfo = await AdditionalInfo.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!additionalInfo) {
      return res.status(404).json({ message: 'Additional info record not found' });
    }
    res.json(additionalInfo);
  } catch (err) {
    next(err);
  }
};

// Delete additional info
exports.deleteAdditionalInfo = async (req, res, next) => {
  try {
    const additionalInfo = await AdditionalInfo.findByIdAndDelete(req.params.id);
    if (!additionalInfo) {
      return res.status(404).json({ message: 'Additional info record not found' });
    }
    res.json({ message: 'Additional info record deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// Get additional info statistics
exports.getAdditionalInfoStats = async (req, res, next) => {
  try {
    const totalRecords = await AdditionalInfo.countDocuments();
    const registeredBikes = await AdditionalInfo.countDocuments({ registrationStatus: 'Registered' });
    const pendingRegistration = await AdditionalInfo.countDocuments({ registrationStatus: 'Pending' });
    const expiredRegistration = await AdditionalInfo.countDocuments({ registrationStatus: 'Expired' });
    
    const deliveredBikes = await AdditionalInfo.countDocuments({ bikeDeliveryStatus: 'Delivered' });
    const pendingDelivery = await AdditionalInfo.countDocuments({ bikeDeliveryStatus: 'Pending' });
    const inTransit = await AdditionalInfo.countDocuments({ bikeDeliveryStatus: 'In Transit' });
    
    const averageRating = await AdditionalInfo.aggregate([
      { $match: { customerRating: { $gt: 0 } } },
      { $group: { _id: null, average: { $avg: '$customerRating' } } }
    ]);

    const expiringInsurance = await AdditionalInfo.countDocuments({
      insuranceExpiryDate: {
        $gte: new Date(),
        $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Next 30 days
      }
    });

    const recentRecords = await AdditionalInfo.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('bikeId customerId registrationStatus bikeDeliveryStatus customerRating');

    const topRatedRecords = await AdditionalInfo.find({ customerRating: { $gt: 0 } })
      .sort({ customerRating: -1 })
      .limit(5)
      .select('bikeId customerId customerRating customerFeedback');

    res.json({
      overall: {
        totalRecords,
        registeredBikes,
        pendingRegistration,
        expiredRegistration,
        deliveredBikes,
        pendingDelivery,
        inTransit,
        averageRating: averageRating[0]?.average || 0,
        expiringInsurance
      },
      recentRecords,
      topRatedRecords
    });
  } catch (err) {
    next(err);
  }
}; 