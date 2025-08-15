const AccountData = require('../models/AccountData');

// Get all account data with pagination and filtering
exports.getAllAccountData = async (req, res) => {
  try {
    const { page = 1, limit = 50, search = '', startDate, endDate, sortBy = 'date', sortOrder = 'desc' } = req.query;
    
    const skip = (page - 1) * limit;
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    let query = {};
    
    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { details: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } },
        { remarks: { $regex: search, $options: 'i' } }
      ];
    }

    // Date range filtering
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const accountData = await AccountData.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await AccountData.countDocuments(query);

    res.json({
      data: accountData,
      pagination: {
        current: parseInt(page),
        pageSize: parseInt(limit),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching account data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get single account data entry
exports.getAccountDataById = async (req, res) => {
  try {
    const accountData = await AccountData.findById(req.params.id);
    if (!accountData) {
      return res.status(404).json({ message: 'Account data not found' });
    }
    res.json(accountData);
  } catch (error) {
    console.error('Error fetching account data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Create new account data entry
exports.createAccountData = async (req, res) => {
  try {
    const accountData = new AccountData(req.body);
    const savedData = await accountData.save();
    res.status(201).json(savedData);
  } catch (error) {
    console.error('Error creating account data:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update account data entry
exports.updateAccountData = async (req, res) => {
  try {
    const accountData = await AccountData.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!accountData) {
      return res.status(404).json({ message: 'Account data not found' });
    }
    res.json(accountData);
  } catch (error) {
    console.error('Error updating account data:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete account data entry
exports.deleteAccountData = async (req, res) => {
  try {
    const accountData = await AccountData.findByIdAndDelete(req.params.id);
    if (!accountData) {
      return res.status(404).json({ message: 'Account data not found' });
    }
    res.json({ message: 'Account data deleted successfully' });
  } catch (error) {
    console.error('Error deleting account data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Bulk import account data
exports.bulkImportAccountData = async (req, res) => {
  try {
    const { data } = req.body;
    
    if (!Array.isArray(data)) {
      return res.status(400).json({ message: 'Data must be an array' });
    }

    const processedData = data.map(item => ({
      date: new Date(item.date),
      name: item.name || '',
      details: item.details || '',
      amount: parseFloat(item.amount) || 0,
      model: item.model || '',
      color: item.color || '',
      credit: parseFloat(item.credit) || 0,
      cost: parseFloat(item.cost) || 0,
      balance: parseFloat(item.balance) || 0,
      chequeReceivedDate: item.chequeReceivedDate ? new Date(item.chequeReceivedDate) : null,
      chequeReleaseDate: item.chequeReleaseDate ? new Date(item.chequeReleaseDate) : null,
      paymentMode: item.paymentMode || '',
      remarks: item.remarks || '',
      leasing: item.leasing || ''
    }));

    const result = await AccountData.insertMany(processedData);
    res.status(201).json({ 
      message: `Successfully imported ${result.length} records`,
      count: result.length 
    });
  } catch (error) {
    console.error('Error bulk importing account data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get account data statistics
exports.getAccountDataStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter.date = {};
      if (startDate) dateFilter.date.$gte = new Date(startDate);
      if (endDate) dateFilter.date.$lte = new Date(endDate);
    }

    const stats = await AccountData.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          totalCredit: { $sum: '$credit' },
          totalCost: { $sum: '$cost' },
          totalBalance: { $sum: '$balance' },
          count: { $sum: 1 }
        }
      }
    ]);

    const result = stats[0] || {
      totalAmount: 0,
      totalCredit: 0,
      totalCost: 0,
      totalBalance: 0,
      count: 0
    };

    res.json(result);
  } catch (error) {
    console.error('Error fetching account data stats:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}; 