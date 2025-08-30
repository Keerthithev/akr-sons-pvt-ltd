const AdvancedCustomer = require('../models/AdvancedCustomer');

// Get all advanced customers with pagination and search
const getAdvancedCustomers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = '', bikeModel = '' } = req.query;
    const skip = (page - 1) * limit;

    let query = {};

    // Search functionality
    if (search) {
      query.$or = [
        { customerName: { $regex: search, $options: 'i' } },
        { contactNo: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { bikeModel: { $regex: search, $options: 'i' } }
      ];
    }

    // Status filter
    if (status && status !== 'All') {
      query.status = status;
    }

    // Bike model filter
    if (bikeModel) {
      query.bikeModel = { $regex: bikeModel, $options: 'i' };
    }

    const customers = await AdvancedCustomer.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await AdvancedCustomer.countDocuments(query);

    res.json({
      success: true,
      advancedCustomers: customers,
      pagination: {
        current: parseInt(page),
        pageSize: parseInt(limit),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching advanced customers:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch advanced customers' });
  }
};

// Get advanced customer by ID
const getAdvancedCustomerById = async (req, res) => {
  try {
    const customer = await AdvancedCustomer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Advanced customer not found' });
    }
    res.json({ success: true, advancedCustomer: customer });
  } catch (error) {
    console.error('Error fetching advanced customer:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch advanced customer' });
  }
};

// Create new advanced customer
const createAdvancedCustomer = async (req, res) => {
  try {
    const customer = new AdvancedCustomer(req.body);
    await customer.save();
    res.status(201).json({ success: true, advancedCustomer: customer });
  } catch (error) {
    console.error('Error creating advanced customer:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: 'Failed to create advanced customer' });
  }
};

// Update advanced customer
const updateAdvancedCustomer = async (req, res) => {
  try {
    const customer = await AdvancedCustomer.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Advanced customer not found' });
    }
    res.json({ success: true, advancedCustomer: customer });
  } catch (error) {
    console.error('Error updating advanced customer:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: 'Failed to update advanced customer' });
  }
};

// Delete advanced customer
const deleteAdvancedCustomer = async (req, res) => {
  try {
    const customer = await AdvancedCustomer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Advanced customer not found' });
    }

    // Find the corresponding AccountData entry for this advanced customer
    const AccountData = require('../models/AccountData');
    const accountDataEntry = await AccountData.findOne({
      type: 'Advanced Customer',
      name: customer.customerName,
      amount: customer.advanceAmount
    });

    if (accountDataEntry) {
      // Check if the amount was deposited to bank
      if (accountDataEntry.depositedToBank) {
        // If deposited, reduce the bank deposit amount
        const BankDeposit = require('../models/BankDeposit');
        const bankDeposit = await BankDeposit.findOne({
          payment: accountDataEntry.amount,
          date: accountDataEntry.bankDepositDate
        });

        if (bankDeposit) {
          // Reduce the bank deposit amount
          bankDeposit.payment -= accountDataEntry.amount;
          if (bankDeposit.payment === 0) {
            // If payment becomes 0, delete the bank deposit record
            await BankDeposit.findByIdAndDelete(bankDeposit._id);
          } else {
            await bankDeposit.save();
          }
        }
      } else {
        // If not deposited, mark the account data entry as deposited (to cancel the pending amount)
        accountDataEntry.depositedToBank = true;
        accountDataEntry.depositedAmount = accountDataEntry.amount;
        accountDataEntry.bankDepositDate = new Date();
        await accountDataEntry.save();
      }

      // Delete the account data entry
      await AccountData.findByIdAndDelete(accountDataEntry._id);
    }

    // Create a refund entry in Bank Deposit for tracking
    const BankDeposit = require('../models/BankDeposit');
    const refundEntry = new BankDeposit({
      date: new Date(),
      depositerName: customer.customerName,
      payment: -(customer.advanceAmount || 0), // Negative amount for refund
      transactionType: 'outcome',
      description: `Refund - Advanced Customer Cancellation (${customer.customerName})`,
      quantity: 1,
      purpose: `Refund of advance payment for ${customer.bikeModel} ${customer.bikeColor} pre-booking cancellation`
    });
    await refundEntry.save();

    // Delete the advanced customer
    await AdvancedCustomer.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Advanced customer deleted successfully' });
  } catch (error) {
    console.error('Error deleting advanced customer:', error);
    res.status(500).json({ success: false, message: 'Failed to delete advanced customer' });
  }
};

// Get advanced customer statistics
const getAdvancedCustomerStats = async (req, res) => {
  try {
    // Get total counts
    const totalCustomers = await AdvancedCustomer.countDocuments();
    const totalPreBookings = await AdvancedCustomer.countDocuments({ status: { $in: ['Pending', 'Confirmed'] } });
    const totalAdvanceAmount = await AdvancedCustomer.aggregate([
      { $group: { _id: null, total: { $sum: '$advanceAmount' } } }
    ]);

    // Get bike statistics
    const bikeStats = await AdvancedCustomer.aggregate([
      {
        $group: {
          _id: '$bikeModel',
          count: { $sum: 1 },
          totalAdvanceAmount: { $sum: '$advanceAmount' },
          pendingCount: {
            $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0] }
          },
          confirmedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'Confirmed'] }, 1, 0] }
          },
          cancelledCount: {
            $sum: { $cond: [{ $eq: ['$status', 'Cancelled'] }, 1, 0] }
          },
          deliveredCount: {
            $sum: { $cond: [{ $eq: ['$status', 'Delivered'] }, 1, 0] }
          }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Get status breakdown
    const statusStats = await AdvancedCustomer.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAdvanceAmount: { $sum: '$advanceAmount' }
        }
      }
    ]);

    res.json({
      success: true,
      stats: {
        totalCustomers,
        totalPreBookings,
        totalAdvanceAmount: totalAdvanceAmount[0]?.total || 0,
        bikeStats,
        statusStats
      }
    });
  } catch (error) {
    console.error('Error fetching advanced customer stats:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch advanced customer statistics' });
  }
};

// Get available bike models from BikeInventory
const getAvailableBikeModels = async (req, res) => {
  try {
    const BikeInventory = require('../models/BikeInventory');
    const bikeModels = await BikeInventory.distinct('model').sort();
    res.json({ success: true, bikeModels: bikeModels.filter(model => model && model.trim() !== '') });
  } catch (error) {
    console.error('Error fetching bike models:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch bike models' });
  }
};

// Get available bike colors from BikeInventory
const getAvailableBikeColors = async (req, res) => {
  try {
    const BikeInventory = require('../models/BikeInventory');
    const bikeColors = await BikeInventory.distinct('color').sort();
    res.json({ success: true, bikeColors: bikeColors.filter(color => color && color.trim() !== '') });
  } catch (error) {
    console.error('Error fetching bike colors:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch bike colors' });
  }
};

// Get bike models with colors
const getBikeModelsWithColors = async (req, res) => {
  try {
    const BikeInventory = require('../models/BikeInventory');
    const bikes = await BikeInventory.aggregate([
      {
        $group: {
          _id: '$model',
          colors: { $addToSet: '$color' },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          model: '$_id',
          colors: { $filter: { input: '$colors', cond: { $ne: ['$$this', ''] } } },
          count: 1
        }
      },
      { $sort: { model: 1 } }
    ]);
    res.json({ success: true, bikes });
  } catch (error) {
    console.error('Error fetching bike models with colors:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch bike models with colors' });
  }
};

module.exports = {
  getAdvancedCustomers,
  getAdvancedCustomerById,
  createAdvancedCustomer,
  updateAdvancedCustomer,
  deleteAdvancedCustomer,
  getAdvancedCustomerStats,
  getAvailableBikeModels,
  getAvailableBikeColors,
  getBikeModelsWithColors
}; 