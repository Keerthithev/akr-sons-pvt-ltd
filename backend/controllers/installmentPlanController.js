const InstallmentPlan = require('../models/InstallmentPlan');

// Generate the next installmentId in the format 'IP-001', 'IP-002', ...
async function generateInstallmentId() {
  const latest = await InstallmentPlan.findOne({ installmentId: /^IP-\d+$/i })
    .sort({ createdAt: -1 })
    .lean();
  let nextNum = 1;
  if (latest && latest.installmentId) {
    const match = latest.installmentId.match(/IP-(\d+)/i);
    if (match) {
      nextNum = parseInt(match[1], 10) + 1;
    }
  }
  const padded = String(nextNum).padStart(3, '0');
  return `IP-${padded}`;
}

// Create a new installment plan
exports.createInstallmentPlan = async (req, res, next) => {
  try {
    const installmentId = await generateInstallmentId();
    const installmentPlan = new InstallmentPlan({ ...req.body, installmentId });
    await installmentPlan.save();
    res.status(201).json(installmentPlan);
  } catch (err) {
    next(err);
  }
};

// Get all installment plans with pagination and search
exports.getAllInstallmentPlans = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '', status = '', month = '' } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    
    if (search) {
      query.$or = [
        { customerName: { $regex: search, $options: 'i' } },
        { installmentId: { $regex: search, $options: 'i' } },
        { vehicleModel: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status) {
      query.paymentStatus = status;
    }
    
    if (month) {
      query.month = month;
    }

    const installmentPlans = await InstallmentPlan.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await InstallmentPlan.countDocuments(query);

    res.json({
      installmentPlans,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    next(err);
  }
};

// Get installment plan by ID
exports.getInstallmentPlanById = async (req, res, next) => {
  try {
    const installmentPlan = await InstallmentPlan.findById(req.params.id);
    if (!installmentPlan) {
      return res.status(404).json({ message: 'Installment plan not found' });
    }
    res.json(installmentPlan);
  } catch (err) {
    next(err);
  }
};

// Update installment plan
exports.updateInstallmentPlan = async (req, res, next) => {
  try {
    const installmentPlan = await InstallmentPlan.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!installmentPlan) {
      return res.status(404).json({ message: 'Installment plan not found' });
    }
    res.json(installmentPlan);
  } catch (err) {
    next(err);
  }
};

// Delete installment plan
exports.deleteInstallmentPlan = async (req, res, next) => {
  try {
    const installmentPlan = await InstallmentPlan.findByIdAndDelete(req.params.id);
    if (!installmentPlan) {
      return res.status(404).json({ message: 'Installment plan not found' });
    }
    res.json({ message: 'Installment plan deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// Get installment plan statistics
exports.getInstallmentPlanStats = async (req, res, next) => {
  try {
    const stats = await InstallmentPlan.aggregate([
      {
        $group: {
          _id: null,
          totalPlans: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' },
          totalRemainingBalance: { $sum: '$remainingBalance' },
          activePlans: {
            $sum: { $cond: [{ $eq: ['$paymentStatus', 'Active'] }, 1, 0] }
          },
          completedPlans: {
            $sum: { $cond: [{ $eq: ['$paymentStatus', 'Completed'] }, 1, 0] }
          },
          overduePlans: {
            $sum: { $cond: [{ $eq: ['$paymentStatus', 'Overdue'] }, 1, 0] }
          },
          defaultedPlans: {
            $sum: { $cond: [{ $eq: ['$paymentStatus', 'Defaulted'] }, 1, 0] }
          }
        }
      }
    ]);

    const monthlyStats = await InstallmentPlan.aggregate([
      {
        $group: {
          _id: '$month',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      overall: stats[0] || {
        totalPlans: 0,
        totalAmount: 0,
        totalRemainingBalance: 0,
        activePlans: 0,
        completedPlans: 0,
        overduePlans: 0,
        defaultedPlans: 0
      },
      monthly: monthlyStats
    });
  } catch (err) {
    next(err);
  }
}; 