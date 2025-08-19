const BankDeposit = require('../models/BankDeposit');

// Get all bank deposits with pagination and search
exports.getAllBankDeposits = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const search = req.query.search || '';
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;

    const skip = (page - 1) * limit;

    // Build query
    let query = {};
    
    if (search) {
      query.$or = [
        { depositerName: { $regex: search, $options: 'i' } },
        { accountName: { $regex: search, $options: 'i' } },
        { purpose: { $regex: search, $options: 'i' } },
        { accountNumber: { $regex: search, $options: 'i' } }
      ];
    }

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Get total count
    const total = await BankDeposit.countDocuments(query);

    // Get data
    const bankDeposits = await BankDeposit.find(query)
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      data: bankDeposits,
      pagination: {
        current: page,
        pageSize: limit,
        total
      }
    });
  } catch (error) {
    console.error('Error fetching bank deposits:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch bank deposits' });
  }
};

// Get bank deposit by ID
exports.getBankDepositById = async (req, res) => {
  try {
    const bankDeposit = await BankDeposit.findById(req.params.id);
    if (!bankDeposit) {
      return res.status(404).json({ success: false, message: 'Bank deposit not found' });
    }
    res.json({ success: true, data: bankDeposit });
  } catch (error) {
    console.error('Error fetching bank deposit:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch bank deposit' });
  }
};

// Create new bank deposit
exports.createBankDeposit = async (req, res) => {
  try {
    const bankDeposit = new BankDeposit(req.body);
    await bankDeposit.save();
    res.status(201).json({ success: true, data: bankDeposit });
  } catch (error) {
    console.error('Error creating bank deposit:', error);
    res.status(500).json({ success: false, message: 'Failed to create bank deposit' });
  }
};

// Update bank deposit
exports.updateBankDeposit = async (req, res) => {
  try {
    const bankDeposit = await BankDeposit.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!bankDeposit) {
      return res.status(404).json({ success: false, message: 'Bank deposit not found' });
    }
    res.json({ success: true, data: bankDeposit });
  } catch (error) {
    console.error('Error updating bank deposit:', error);
    res.status(500).json({ success: false, message: 'Failed to update bank deposit' });
  }
};

// Delete bank deposit
exports.deleteBankDeposit = async (req, res) => {
  try {
    const bankDeposit = await BankDeposit.findByIdAndDelete(req.params.id);
    if (!bankDeposit) {
      return res.status(404).json({ success: false, message: 'Bank deposit not found' });
    }
    res.json({ success: true, message: 'Bank deposit deleted successfully' });
  } catch (error) {
    console.error('Error deleting bank deposit:', error);
    res.status(500).json({ success: false, message: 'Failed to delete bank deposit' });
  }
};

// Bulk import bank deposits
exports.bulkImportBankDeposits = async (req, res) => {
  try {
    const { bankDeposits } = req.body;
    
    if (!Array.isArray(bankDeposits)) {
      return res.status(400).json({ success: false, message: 'Invalid data format' });
    }

    const importedDeposits = [];
    const errors = [];

    for (let i = 0; i < bankDeposits.length; i++) {
      try {
        const deposit = new BankDeposit(bankDeposits[i]);
        await deposit.save();
        importedDeposits.push(deposit);
      } catch (error) {
        errors.push(`Row ${i + 1}: ${error.message}`);
      }
    }

    res.json({
      success: true,
      message: `Imported ${importedDeposits.length} bank deposits successfully`,
      importedCount: importedDeposits.length,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('Error bulk importing bank deposits:', error);
    res.status(500).json({ success: false, message: 'Failed to import bank deposits' });
  }
};

// Get bank deposit statistics
exports.getBankDepositStats = async (req, res) => {
  try {
    const stats = await BankDeposit.aggregate([
      {
        $group: {
          _id: null,
          totalPayment: { $sum: '$payment' },
          totalQuantity: { $sum: '$quantity' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Get quantity breakdown by purpose categories
    const quantityBreakdown = await BankDeposit.aggregate([
      {
        $group: {
          _id: {
            $cond: {
              if: { $regexMatch: { input: { $toLower: '$purpose' }, regex: 'oil' } },
              then: 'Oil',
              else: {
                $cond: {
                  if: { $regexMatch: { input: { $toLower: '$purpose' }, regex: 'helmet' } },
                  then: 'Helmet',
                  else: 'Others'
                }
              }
            }
          },
          quantity: { $sum: '$quantity' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    const result = stats[0] || { totalPayment: 0, totalQuantity: 0, count: 0 };

    // Convert breakdown to object format
    const breakdown = {
      Oil: 0,
      Helmet: 0,
      Others: 0
    };

    quantityBreakdown.forEach(item => {
      breakdown[item._id] = item.quantity;
    });

    res.json({
      success: true,
      data: {
        totalPayment: result.totalPayment,
        totalQuantity: result.totalQuantity,
        count: result.count,
        quantityBreakdown: breakdown
      }
    });
  } catch (error) {
    console.error('Error fetching bank deposit stats:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch bank deposit statistics' });
  }
}; 