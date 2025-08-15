const SalesTransaction = require('../models/SalesTransaction');

// Get all sales transactions with pagination and search
const getAllSalesTransactions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const search = req.query.search || '';
    const skip = (page - 1) * limit;

    let query = {};
    
    // Search functionality
    if (search) {
      query = {
        $or: [
          { invoiceNo: { $regex: search, $options: 'i' } },
          { bikeId: { $regex: search, $options: 'i' } },
          { customerName: { $regex: search, $options: 'i' } },
          { salespersonName: { $regex: search, $options: 'i' } },
          { paymentMethod: { $regex: search, $options: 'i' } },
          { paymentStatus: { $regex: search, $options: 'i' } },
          { warrantyPeriod: { $regex: search, $options: 'i' } },
          { freeServiceDetails: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const [transactions, total] = await Promise.all([
      SalesTransaction.find(query)
        .sort({ salesDate: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      SalesTransaction.countDocuments(query)
    ]);

    res.json({
      data: transactions,
      pagination: {
        current: page,
        pageSize: limit,
        total
      }
    });
  } catch (error) {
    console.error('Error fetching sales transactions:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get sales transaction by ID
const getSalesTransactionById = async (req, res) => {
  try {
    const transaction = await SalesTransaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: 'Sales transaction not found' });
    }
    res.json(transaction);
  } catch (error) {
    console.error('Error fetching sales transaction:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Create new sales transaction
const createSalesTransaction = async (req, res) => {
  try {
    const transaction = new SalesTransaction(req.body);
    await transaction.save();
    res.status(201).json(transaction);
  } catch (error) {
    console.error('Error creating sales transaction:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Invoice number already exists' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update sales transaction
const updateSalesTransaction = async (req, res) => {
  try {
    const transaction = await SalesTransaction.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!transaction) {
      return res.status(404).json({ message: 'Sales transaction not found' });
    }
    res.json(transaction);
  } catch (error) {
    console.error('Error updating sales transaction:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Invoice number already exists' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete sales transaction
const deleteSalesTransaction = async (req, res) => {
  try {
    const transaction = await SalesTransaction.findByIdAndDelete(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: 'Sales transaction not found' });
    }
    res.json({ message: 'Sales transaction deleted successfully' });
  } catch (error) {
    console.error('Error deleting sales transaction:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get sales transaction statistics
const getSalesTransactionStats = async (req, res) => {
  try {
    const stats = await SalesTransaction.aggregate([
      {
        $group: {
          _id: null,
          totalTransactions: { $sum: 1 },
          totalSellingPrice: { $sum: '$sellingPrice' },
          totalDiscountApplied: { $sum: '$discountApplied' },
          totalFinalAmount: { $sum: '$finalAmount' },
          averageSellingPrice: { $avg: '$sellingPrice' },
          averageDiscount: { $avg: '$discountApplied' },
          averageFinalAmount: { $avg: '$finalAmount' }
        }
      }
    ]);

    // Get payment status breakdown
    const paymentStatusStats = await SalesTransaction.aggregate([
      {
        $group: {
          _id: '$paymentStatus',
          count: { $sum: 1 },
          totalAmount: { $sum: '$finalAmount' }
        }
      }
    ]);

    // Get payment method breakdown
    const paymentMethodStats = await SalesTransaction.aggregate([
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          totalAmount: { $sum: '$finalAmount' }
        }
      }
    ]);

    // Get monthly sales breakdown
    const monthlyStats = await SalesTransaction.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$salesDate' },
            month: { $month: '$salesDate' }
          },
          count: { $sum: 1 },
          totalAmount: { $sum: '$finalAmount' }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } }
    ]);

    const result = {
      ...stats[0],
      paymentStatusStats,
      paymentMethodStats,
      monthlyStats
    };

    res.json(result);
  } catch (error) {
    console.error('Error fetching sales transaction stats:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Bulk import sales transactions
const bulkImportSalesTransactions = async (req, res) => {
  try {
    const { transactions } = req.body;
    
    if (!Array.isArray(transactions)) {
      return res.status(400).json({ message: 'Transactions must be an array' });
    }

    const result = await SalesTransaction.insertMany(transactions, { 
      ordered: false,
      rawResult: true 
    });

    res.json({
      message: `Successfully imported ${result.insertedCount} transactions`,
      insertedCount: result.insertedCount,
      errors: result.writeErrors || []
    });
  } catch (error) {
    console.error('Error bulk importing sales transactions:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getAllSalesTransactions,
  getSalesTransactionById,
  createSalesTransaction,
  updateSalesTransaction,
  deleteSalesTransaction,
  getSalesTransactionStats,
  bulkImportSalesTransactions
}; 