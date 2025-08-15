const Customer = require('../models/Customer');

// Get all customers with pagination and search
const getAllCustomers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const skip = (page - 1) * limit;

    let query = {};
    if (search) {
      query = {
        $or: [
          { fullName: { $regex: search, $options: 'i' } },
          { nicDrivingLicense: { $regex: search, $options: 'i' } },
          { phoneNo: { $regex: search, $options: 'i' } },
          { address: { $regex: search, $options: 'i' } },
          { language: { $regex: search, $options: 'i' } },
          { occupation: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const [customers, total] = await Promise.all([
      Customer.find(query)
        .sort({ dateOfPurchase: -1 })
        .skip(skip)
        .limit(limit),
      Customer.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({
      data: customers,
      pagination: {
        current: page,
        total: totalPages,
        totalRecords: total,
        limit
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get customer by ID
const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new customer
const createCustomer = async (req, res) => {
  try {
    const customer = new Customer(req.body);
    const savedCustomer = await customer.save();
    res.status(201).json(savedCustomer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update customer
const updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.json(customer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete customer
const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Bulk import customers
const bulkImportCustomers = async (req, res) => {
  try {
    const { customers } = req.body;
    
    if (!Array.isArray(customers) || customers.length === 0) {
      return res.status(400).json({ message: 'Invalid data format' });
    }

    const savedCustomers = await Customer.insertMany(customers);
    res.status(201).json({
      message: `${savedCustomers.length} customers imported successfully`,
      count: savedCustomers.length
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get customer statistics
const getCustomerStats = async (req, res) => {
  try {
    const stats = await Customer.aggregate([
      {
        $group: {
          _id: null,
          totalCustomers: { $sum: 1 },
          totalWithPhone: { $sum: { $cond: [{ $ne: ['$phoneNo', ''] }, 1, 0] } },
          totalWithNIC: { $sum: { $cond: [{ $ne: ['$nicDrivingLicense', ''] }, 1, 0] } }
        }
      }
    ]);

    const languageStats = await Customer.aggregate([
      {
        $group: {
          _id: '$language',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const occupationStats = await Customer.aggregate([
      {
        $group: {
          _id: '$occupation',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const result = stats[0] || {
      totalCustomers: 0,
      totalWithPhone: 0,
      totalWithNIC: 0
    };

    res.json({
      ...result,
      languageStats,
      occupationStats
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  bulkImportCustomers,
  getCustomerStats
}; 